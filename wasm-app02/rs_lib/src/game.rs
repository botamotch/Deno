use anyhow::anyhow;
use anyhow::Result;
use async_trait::async_trait;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;

use crate::browser;

use crate::engine;
use crate::engine::{Game, Image, KeyState, Point, Rect, Renderer};

#[derive(Deserialize, Clone)]
struct SheetRect {
  x: i16,
  y: i16,
  w: i16,
  h: i16,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Cell {
  frame: SheetRect,
  sprite_source_size: SheetRect,
}

#[derive(Deserialize, Clone)]
pub struct Sheet {
  frames: HashMap<String, Cell>,
}

pub enum WalkTheDog {
  Loading,
  Loaded(Walk),
}

pub struct Walk {
  boy: red_hat_boy::RedHatBoy,
  background: Image,
  stone: Image,
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

        Ok(Box::new(WalkTheDog::Loaded(Walk {
          boy: rhb,
          background: Image::new(background, Point { x: 0, y: 0 }),
          stone: Image::new(stone, Point { x: 350, y: 546 }),
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
      width: 600.0,
      height: 600.0,
    });

    if let WalkTheDog::Loaded(walk) = self {
      walk.background.draw(renderer);
      walk.boy.draw(renderer);
      walk.stone.draw(renderer);
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
  use super::{Cell, Sheet};
  use crate::engine::{Point, Rect, Renderer};
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
        &self.bounding_box(),
      );
    }

    pub fn bounding_box(&self) -> Rect {
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
  }

  enum Event {
    Run,
    Slide,
    Update,
    Jump,
    KnockOut,
  }

  #[derive(Copy, Clone)]
  enum RedHatBoyStateMachine {
    Idle(RedHatBoyState<Idle>),
    Running(RedHatBoyState<Running>),
    Sliding(RedHatBoyState<Sliding>),
    Jumping(RedHatBoyState<Jumping>),
    Falling(RedHatBoyState<Falling>),
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
      }
    }

    fn context(&self) -> &RedHatBoyContext {
      match self {
        RedHatBoyStateMachine::Idle(state) => &state.context,
        RedHatBoyStateMachine::Running(state) => &state.context,
        RedHatBoyStateMachine::Sliding(state) => &state.context,
        RedHatBoyStateMachine::Jumping(state) => &state.context,
        RedHatBoyStateMachine::Falling(state) => &state.context,
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
        JumpingEndState::Complete(running_state) => running_state.into(),
        JumpingEndState::Jumping(jumping_state) => jumping_state.into(),
      }
    }
  }

  impl From<RedHatBoyState<Falling>> for RedHatBoyStateMachine {
    fn from(state: RedHatBoyState<Falling>) -> Self {
      RedHatBoyStateMachine::Falling(state)
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
  struct RedHatBoyState<S> {
    context: RedHatBoyContext,
    _state: S,
  }

  // impl<S> RedHatBoyState<S> {
  //   fn context(&self) -> &RedHatBoyContext {
  //     &self.context
  //   }
  // }

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
      self.context = self.context.update(FRAMES_IDLE);
      self
    }
  }

  impl RedHatBoyState<Running> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_RUN
    }

    fn update(mut self) -> Self {
      self.context = self.context.update(FRAMES_RUN);
      self
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
      self.context = self.context.update(FRAMES_SLIDING);

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
    Complete(RedHatBoyState<Running>),
    Jumping(RedHatBoyState<Jumping>),
  }

  impl RedHatBoyState<Jumping> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_JUMPING
    }

    pub fn land(self) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context.reset_frame(),
        _state: Running,
      }
    }

    pub fn update(mut self) -> JumpingEndState {
      self.context = self.context.update(FRAMES_JUMPING);
      if self.context.position.y >= FLOOR {
        JumpingEndState::Complete(self.land())
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

  impl RedHatBoyState<Falling> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_FALLING
    }

    pub fn update(mut self) -> Self {
      self.context = self.context.update(FRAMES_FALLING);
      self
    }
  }
}
