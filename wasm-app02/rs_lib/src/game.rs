use anyhow::anyhow;
use anyhow::Result;
use async_trait::async_trait;
use serde_wasm_bindgen::from_value;

use crate::browser;
use crate::engine;
use crate::engine::Sheet;
use crate::engine::{Game, Image, KeyState, Point, Rect, Renderer};

use self::red_hat_boy::Platform;
use self::red_hat_boy::RedHatBoy;

const HEIGHT: i16 = 600;

pub enum WalkTheDog {
  Loading,
  Loaded(Walk),
}

pub struct Walk {
  boy: RedHatBoy,
  background: Image,
  stone: Image,
  platform: Platform,
}

impl WalkTheDog {
  pub fn new() -> Self {
    WalkTheDog::Loading
  }
}

#[async_trait(?Send)]
impl Game for WalkTheDog {
  async fn initilalize(&self) -> Result<Box<dyn Game>> {
    match self {
      WalkTheDog::Loading => {
        let sheet: Sheet = from_value(browser::fetch_json("rhb.json").await?)
          .expect("Could not convert rhb.json into a Sheet structure");
        let sheet: Option<Sheet> = Some(sheet);
        let image = Some(engine::load_image("rhb.png").await?);
        let background = engine::load_image("BG.png").await?;
        let stone = engine::load_image("Stone.png").await?;

        let rhb = red_hat_boy::RedHatBoy::new(
          sheet.clone().ok_or_else(|| anyhow!("No Sheet Present"))?,
          image.clone().ok_or_else(|| anyhow!("No Image Present"))?,
        );

        let platform_sheet =
          from_value(browser::fetch_json("tiles.json").await?)
            .expect("Could not convert tiles.json into a Sheet structure");
        let platform = Platform::new(
          platform_sheet,
          engine::load_image("tiles.png").await?,
          Point { x: 300, y: 400 },
        );

        Ok(Box::new(WalkTheDog::Loaded(Walk {
          boy: rhb,
          background: Image::new(background, Point { x: 0, y: 0 }),
          stone: Image::new(stone, Point { x: 350, y: 546 }),
          platform,
        })))
      }
      WalkTheDog::Loaded(_) => {
        Err(anyhow!("Error: Game is already initilalized!"))
      }
    }
  }
  fn draw(&self, renderer: &Renderer) {
    renderer.clear(&Rect {
      x: 0.0,
      y: 0.0,
      width: 1000.0,
      height: 600.0,
    });

    if let WalkTheDog::Loaded(walk) = self {
      walk.background.draw(renderer);
      walk.boy.draw(renderer);
      walk.stone.draw(renderer);
      walk.platform.draw(renderer);
    }
  }

  fn update(&mut self, keystate: &KeyState) {
    if let WalkTheDog::Loaded(walk) = self {
      if keystate.is_pressed("ArrowDown") {
        walk.boy.slide();
      }

      if keystate.is_pressed("ArrowRight") {
        walk.boy.run_right();
      }

      if keystate.is_pressed("Space") {
        walk.boy.jump();
      }

      walk.boy.update();

      for bounding_box in &walk.platform.bounding_boxes() {
        if walk.boy.bounding_box().intersects(bounding_box) {
          if walk.boy.velocity_y() > 0
            && walk.boy.pos_y() < walk.platform.position.y
          {
            walk.boy.land_on(bounding_box.y);
          } else {
            walk.boy.knock_out();
          }
        }
      }

      if walk
        .boy
        .bounding_box()
        .intersects(walk.stone.bounding_box())
      {
        walk.boy.knock_out();
      }
    }
  }
}

mod red_hat_boy {
  use super::{Sheet, HEIGHT};
  use crate::engine::{Cell, Point, Rect, Renderer};
  use web_sys::HtmlImageElement;

  const FLOOR: i16 = 479;
  const STARTING_POINT: i16 = -20;
  const FRAME_NAME_IDLE: &str = "Idle";
  const FRAME_NAME_RUN: &str = "Run";
  const FRAME_NAME_SLIDING: &str = "Slide";
  const FRAME_NAME_JUMPING: &str = "Jump";
  const FRAME_NAME_FALLING: &str = "Dead";
  const FRAMES_IDLE: u8 = 29;
  const FRAMES_RUN: u8 = 23;
  const FRAMES_SLIDING: u8 = 14;
  const FRAMES_JUMPING: u8 = 35;
  const FRAMES_FALLING: u8 = 29;
  const RUNNING_SPEED: i16 = 5;
  const JUMP_SPEED: i16 = -25;
  const GRAVITY: i16 = 1;
  const PLAYER_HEIGHT: i16 = HEIGHT - FLOOR;

  pub struct RedHatBoy {
    state: RedHatBoyStateMachine,
    sprite_sheet: Sheet,
    image: HtmlImageElement,
  }

  impl RedHatBoy {
    pub fn new(sheet: Sheet, image: HtmlImageElement) -> Self {
      RedHatBoy {
        state: RedHatBoyStateMachine::Idle(RedHatBoyState::new()),
        sprite_sheet: sheet,
        image,
      }
    }

    fn frame_name(&self) -> String {
      format!(
        "{} ({}).png",
        self.state.frame_name(),
        (self.state.context().frame / 3) + 1,
      )
    }

    fn current_sprite(&self) -> Option<&Cell> {
      self.sprite_sheet.frames.get(&self.frame_name())
    }

    pub fn draw(&self, renderer: &Renderer) {
      let sprite = self.current_sprite().expect("Could not found");

      renderer.draw_image(
        &self.image,
        &Rect {
          x: sprite.frame.x.into(),
          y: sprite.frame.y.into(),
          width: sprite.frame.w.into(),
          height: sprite.frame.h.into(),
        },
        &self.destination_box(),
      );
    }

    pub fn bounding_box(&self) -> Rect {
      const X_OFFSET: f32 = 18.0;
      const Y_OFFSET: f32 = 14.0;
      const WIDTH_OFFSET: f32 = 28.0;
      let mut bounding_box = self.destination_box();
      bounding_box.x += X_OFFSET;
      bounding_box.y += Y_OFFSET;
      bounding_box.width -= WIDTH_OFFSET;
      bounding_box.height -= Y_OFFSET;
      bounding_box
    }

    pub fn destination_box(&self) -> Rect {
      let sprite = self.current_sprite().expect("Could not found");

      Rect {
        x: (self.state.context().position.x
          + sprite.sprite_source_size.x as i16)
          .into(),
        y: (self.state.context().position.y
          + sprite.sprite_source_size.y as i16)
          .into(),
        width: sprite.frame.w.into(),
        height: sprite.frame.h.into(),
      }
    }

    pub fn update(&mut self) {
      self.state = self.state.update();
    }

    pub fn run_right(&mut self) {
      self.state = self.state.transition(Event::Run);
    }

    pub fn slide(&mut self) {
      self.state = self.state.transition(Event::Slide);
    }

    pub fn jump(&mut self) {
      self.state = self.state.transition(Event::Jump);
    }

    pub fn knock_out(&mut self) {
      self.state = self.state.transition(Event::KnockOut);
    }

    pub fn land_on(&mut self, position: f32) {
      self.state = self.state.transition(Event::Land(position));
    }

    pub fn velocity_y(&self) -> i16 {
      self.state.context().velocity.y
    }

    pub fn pos_y(&self) -> i16 {
      self.state.context().position.y
    }
  }

  enum Event {
    Run,
    Slide,
    Update,
    Jump,
    KnockOut,
    Land(f32),
  }

  #[derive(Copy, Clone)]
  enum RedHatBoyStateMachine {
    Idle(RedHatBoyState<Idle>),
    Running(RedHatBoyState<Running>),
    Sliding(RedHatBoyState<Sliding>),
    Jumping(RedHatBoyState<Jumping>),
    Falling(RedHatBoyState<Falling>),
    KnockedOut(RedHatBoyState<KnockedOut>),
  }

  impl RedHatBoyStateMachine {
    fn transition(self, event: Event) -> Self {
      match (self, event) {
        // Transition
        (RedHatBoyStateMachine::Idle(state), Event::Run) => state.run().into(),
        (RedHatBoyStateMachine::Running(state), Event::Slide) => {
          state.slide().into()
        }
        (RedHatBoyStateMachine::Running(state), Event::Jump) => {
          state.jump().into()
        }
        (RedHatBoyStateMachine::Running(state), Event::KnockOut) => {
          state.knock_out().into()
        }
        (RedHatBoyStateMachine::Jumping(state), Event::KnockOut) => {
          state.knock_out().into()
        }
        (RedHatBoyStateMachine::Sliding(state), Event::KnockOut) => {
          state.knock_out().into()
        }
        (RedHatBoyStateMachine::Jumping(state), Event::Land(position)) => {
          state.land_on(position).into()
        }
        (RedHatBoyStateMachine::Running(state), Event::Land(position)) => {
          state.land_on(position).into()
        }
        // Update
        (RedHatBoyStateMachine::Idle(state), Event::Update) => {
          state.update().into()
        }
        (RedHatBoyStateMachine::Running(state), Event::Update) => {
          state.update().into()
        }
        (RedHatBoyStateMachine::Sliding(state), Event::Update) => {
          state.update().into()
        }
        (RedHatBoyStateMachine::Jumping(state), Event::Update) => {
          state.update().into()
        }
        (RedHatBoyStateMachine::Falling(state), Event::Update) => {
          state.update().into()
        }
        (RedHatBoyStateMachine::KnockedOut(_), Event::Update) => self,
        _ => self,
      }
    }

    fn frame_name(&self) -> &str {
      match self {
        RedHatBoyStateMachine::Idle(state) => state.frame_name(),
        RedHatBoyStateMachine::Running(state) => state.frame_name(),
        RedHatBoyStateMachine::Sliding(state) => state.frame_name(),
        RedHatBoyStateMachine::Jumping(state) => state.frame_name(),
        RedHatBoyStateMachine::Falling(state) => state.frame_name(),
        RedHatBoyStateMachine::KnockedOut(state) => state.frame_name(),
      }
    }

    fn context(&self) -> &RedHatBoyContext {
      match self {
        RedHatBoyStateMachine::Idle(state) => &state.context(),
        RedHatBoyStateMachine::Running(state) => &state.context(),
        RedHatBoyStateMachine::Sliding(state) => &state.context(),
        RedHatBoyStateMachine::Jumping(state) => &state.context(),
        RedHatBoyStateMachine::Falling(state) => &state.context(),
        RedHatBoyStateMachine::KnockedOut(state) => &state.context(),
      }
    }

    fn update(self) -> Self {
      self.transition(Event::Update)
    }
  }

  impl From<RedHatBoyState<Idle>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Idle>) -> Self {
      RedHatBoyStateMachine::Idle(state)
    }
  }

  impl From<RedHatBoyState<Running>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Running>) -> Self {
      RedHatBoyStateMachine::Running(state)
    }
  }

  impl From<RedHatBoyState<Sliding>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Sliding>) -> Self {
      RedHatBoyStateMachine::Sliding(state)
    }
  }

  impl From<RedHatBoyState<Jumping>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Jumping>) -> Self {
      RedHatBoyStateMachine::Jumping(state)
    }
  }

  impl From<SlidingEndState> for RedHatBoyStateMachine {
    fn from(end_state: SlidingEndState) -> Self {
      match end_state {
        SlidingEndState::Complete(running_state) => running_state.into(),
        SlidingEndState::Sliding(sliding_state) => sliding_state.into(),
      }
    }
  }

  impl From<JumpingEndState> for RedHatBoyStateMachine {
    fn from(end_state: JumpingEndState) -> Self {
      match end_state {
        JumpingEndState::Landing(running_state) => running_state.into(),
        JumpingEndState::Jumping(jumping_state) => jumping_state.into(),
      }
    }
  }

  impl From<RedHatBoyState<Falling>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Falling>) -> Self {
      RedHatBoyStateMachine::Falling(state)
    }
  }

  impl From<RedHatBoyState<KnockedOut>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<KnockedOut>) -> Self {
      RedHatBoyStateMachine::KnockedOut(state)
    }
  }

  impl From<FallingEndState> for RedHatBoyStateMachine {
    fn from(end_state: FallingEndState) -> Self {
      match end_state {
        FallingEndState::Complete(knock_out_state) => knock_out_state.into(),
        FallingEndState::Falling(falling_state) => falling_state.into(),
      }
    }
  }

  #[derive(Copy, Clone)]
  struct Idle;

  #[derive(Copy, Clone)]
  struct Running;

  #[derive(Copy, Clone)]
  struct Sliding;

  #[derive(Copy, Clone)]
  struct Jumping;

  #[derive(Copy, Clone)]
  struct Falling;

  #[derive(Copy, Clone)]
  struct KnockedOut;

  #[derive(Copy, Clone)]
  struct RedHatBoyState<S> {
    context: RedHatBoyContext,
    _state: S,
  }

  impl<S> RedHatBoyState<S> {
    pub fn context(&self) -> &RedHatBoyContext {
      &self.context
    }

    fn update_context(&mut self, frames: u8) {
      self.context = self.context.update(frames);
    }
  }

  #[derive(Copy, Clone)]
  struct RedHatBoyContext {
    frame: u8,
    position: Point,
    velocity: Point,
  }

  impl RedHatBoyContext {
    pub fn update(mut self, frame_count: u8) -> Self {
      if self.frame < frame_count {
        self.frame += 1;
      } else {
        self.frame = 0;
      }
      self.velocity.y += GRAVITY;
      self.position.x += self.velocity.x;
      self.position.y += self.velocity.y;
      if self.position.y > FLOOR {
        self.position.y = FLOOR;
      }
      self
    }

    fn reset_frame(mut self) -> Self {
      self.frame = 0;
      self
    }

    fn run_right(mut self) -> Self {
      self.velocity.x += RUNNING_SPEED;
      self
    }

    fn set_vertical_velocity(mut self, y: i16) -> Self {
      self.velocity.y = y;
      self
    }

    fn stop(mut self) -> Self {
      self.velocity.x = 0;
      self.velocity.y = 0;
      self
    }

    fn set_on(mut self, position: i16) -> Self {
      let position = position - PLAYER_HEIGHT;
      self.position.y = position;
      self
    }
  }

  impl RedHatBoyState<Idle> {
    fn new() -> Self {
      RedHatBoyState {
        context: RedHatBoyContext {
          frame: 0,
          position: Point {
            x: STARTING_POINT,
            y: FLOOR,
          },
          velocity: Point { x: 0, y: 0 },
        },
        _state: Idle {},
      }
    }

    fn run(self) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context.reset_frame().run_right(),
        _state: Running {},
      }
    }

    fn frame_name(&self) -> &str {
      FRAME_NAME_IDLE
    }

    fn update(mut self) -> Self {
      self.update_context(FRAMES_IDLE);
      self
    }
  }

  impl RedHatBoyState<Running> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_RUN
    }

    fn update(mut self) -> Self {
      self.update_context(FRAMES_RUN);
      self
    }

    pub fn land_on(self, position: f32) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context.set_on(position as i16),
        _state: Running,
      }
    }

    pub fn slide(self) -> RedHatBoyState<Sliding> {
      RedHatBoyState {
        context: self.context.reset_frame(),
        _state: Sliding {},
      }
    }

    pub fn jump(self) -> RedHatBoyState<Jumping> {
      RedHatBoyState {
        context: self.context.set_vertical_velocity(JUMP_SPEED).reset_frame(),
        _state: Jumping {},
      }
    }

    pub fn knock_out(self) -> RedHatBoyState<Falling> {
      RedHatBoyState {
        context: self.context.reset_frame().stop(),
        _state: Falling {},
      }
    }
  }

  enum SlidingEndState {
    Complete(RedHatBoyState<Running>),
    Sliding(RedHatBoyState<Sliding>),
  }

  impl RedHatBoyState<Sliding> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_SLIDING
    }

    pub fn stand(self) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context.reset_frame(),
        _state: Running,
      }
    }

    pub fn update(mut self) -> SlidingEndState {
      self.update_context(FRAMES_SLIDING);

      if self.context.frame >= FRAMES_SLIDING {
        SlidingEndState::Complete(self.stand())
      } else {
        SlidingEndState::Sliding(self)
      }
    }

    pub fn knock_out(self) -> RedHatBoyState<Falling> {
      RedHatBoyState {
        context: self.context.reset_frame().stop(),
        _state: Falling {},
      }
    }
  }

  enum JumpingEndState {
    Landing(RedHatBoyState<Running>),
    Jumping(RedHatBoyState<Jumping>),
  }

  impl RedHatBoyState<Jumping> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_JUMPING
    }

    pub fn land_on(self, position: f32) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context.reset_frame().set_on(position as i16),
        _state: Running,
      }
    }

    pub fn update(mut self) -> JumpingEndState {
      self.update_context(FRAMES_JUMPING);
      if self.context.position.y >= FLOOR {
        JumpingEndState::Landing(self.land_on(HEIGHT.into()))
      } else {
        JumpingEndState::Jumping(self)
      }
    }

    pub fn knock_out(self) -> RedHatBoyState<Falling> {
      RedHatBoyState {
        context: self.context.reset_frame().stop(),
        _state: Falling {},
      }
    }
  }

  enum FallingEndState {
    Complete(RedHatBoyState<KnockedOut>),
    Falling(RedHatBoyState<Falling>),
  }

  impl RedHatBoyState<Falling> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_FALLING
    }

    pub fn update(mut self) -> FallingEndState {
      self.update_context(FRAMES_FALLING);

      if self.context.frame >= FRAMES_FALLING {
        FallingEndState::Complete(self.dead())
      } else {
        FallingEndState::Falling(self)
      }
    }

    pub fn dead(self) -> RedHatBoyState<KnockedOut> {
      RedHatBoyState {
        context: self.context,
        _state: KnockedOut {},
      }
    }
  }

  impl RedHatBoyState<KnockedOut> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_FALLING
    }
  }

  pub struct Platform {
    sheet: Sheet,
    image: HtmlImageElement,
    pub position: Point,
  }

  impl Platform {
    pub fn new(sheet: Sheet, image: HtmlImageElement, position: Point) -> Self {
      Platform {
        sheet,
        image,
        position,
      }
    }

    pub fn draw(&self, renderer: &Renderer) {
      let platform = self
        .sheet
        .frames
        .get("13.png")
        .expect("13.png does not found");

      renderer.draw_image(
        &self.image,
        &Rect {
          x: platform.frame.x.into(),
          y: platform.frame.y.into(),
          width: (platform.frame.w * 3).into(),
          height: platform.frame.h.into(),
        },
        &self.destination_box(),
      );
    }

    pub fn destination_box(&self) -> Rect {
      let platform = self
        .sheet
        .frames
        .get("13.png")
        .expect("13.png does not found");

      Rect {
        x: self.position.x.into(),
        y: self.position.y.into(),
        width: (platform.frame.w * 3).into(),
        height: platform.frame.h.into(),
      }
    }

    pub fn bounding_boxes(&self) -> Vec<Rect> {
      const X_OFFSET: f32 = 60.0;
      const END_HEIGHT: f32 = 54.0;
      let destination_box = self.destination_box();

      let bounding_box_one = Rect {
        x: destination_box.x,
        y: destination_box.y,
        width: X_OFFSET,
        height: END_HEIGHT,
      };

      let bounding_box_two = Rect {
        x: destination_box.x + X_OFFSET,
        y: destination_box.y,
        width: destination_box.width - (X_OFFSET * 2.0),
        height: destination_box.height,
      };

      let bounding_box_three = Rect {
        x: destination_box.x + destination_box.width - X_OFFSET,
        y: destination_box.y,
        width: X_OFFSET,
        height: END_HEIGHT,
      };

      vec![bounding_box_one, bounding_box_two, bounding_box_three]
    }
  }
}