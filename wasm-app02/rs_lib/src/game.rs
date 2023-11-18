use anyhow::anyhow;
use anyhow::Result;
use async_trait::async_trait;
use rand::prelude::*;
use serde_wasm_bindgen::from_value;
use std::rc::Rc;
use web_sys::HtmlImageElement;

use crate::browser;
use crate::engine;
use crate::engine::{Cell, Game, Image, KeyState, Point, Rect, Renderer, Sheet, SpriteSheet};
use crate::segment::obstacle_stone;
use crate::segment::platform_high;
use crate::segment::stone_and_platform;

use self::red_hat_boy::RedHatBoy;

const TIMELINE_MINIMUN: i16 = 1600;
const OBSTACLE_BUFFER: i16 = 0;

pub enum WalkTheDog {
  Loading,
  Loaded(Walk),
}

pub struct Walk {
  boy: RedHatBoy,
  backgrounds: [Image; 2],
  obstacles: Vec<Box<dyn Obstacle>>,
  obstacle_sheet: Rc<SpriteSheet>,
  stone: HtmlImageElement,
  timeline: i16,
}

impl Walk {
  fn velocity(&self) -> i16 {
    -self.boy.walking_speed()
  }

  fn genereate_next_getment(&mut self) {
    let mut rng = thread_rng();
    let next_segment = rng.gen_range(0..3);

    let mut next_obstacle = match next_segment {
      0 => stone_and_platform(
        self.stone.clone(),
        self.obstacle_sheet.clone(),
        self.timeline + OBSTACLE_BUFFER,
      ),
      1 => platform_high(self.obstacle_sheet.clone(), self.timeline + OBSTACLE_BUFFER),
      _ => obstacle_stone(self.stone.clone(), self.timeline + OBSTACLE_BUFFER),
      // _ => vec![],
    };

    self.timeline = rightmost(&next_obstacle);
    self.obstacles.append(&mut next_obstacle);
  }
}

impl WalkTheDog {
  pub fn new() -> Self {
    WalkTheDog::Loading
  }
}

fn rightmost(obstacle_list: &Vec<Box<dyn Obstacle>>) -> i16 {
  obstacle_list
    .iter()
    .map(|obstacle| obstacle.right())
    .max_by(|x, y| x.cmp(&y))
    .unwrap_or(0)
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

        let tiles = from_value(browser::fetch_json("tiles.json").await?)
          .expect("Could not convert tiles.json into a Sheet structure");

        let sprite_sheet = Rc::new(SpriteSheet::new(
          tiles,
          engine::load_image("tiles.png").await?,
        ));

        let starting_obstacle = stone_and_platform(stone.clone(), sprite_sheet.clone(), 600);
        // let starting_obstacle = obstacle_stone(stone.clone(), 200);
        let timeline = rightmost(&starting_obstacle);
        // log!("timeline : {}", timeline);

        let w = background.width() as i16;
        Ok(Box::new(WalkTheDog::Loaded(Walk {
          boy: rhb,
          backgrounds: [
            Image::new(background.clone(), Point { x: 0, y: 0 }),
            Image::new(background.clone(), Point { x: w, y: 0 }),
          ],
          obstacles: starting_obstacle,
          obstacle_sheet: sprite_sheet,
          stone,
          timeline,
        })))
      }
      WalkTheDog::Loaded(_) => Err(anyhow!("Error: Game is already initilalized!")),
    }
  }
  fn draw(&self, renderer: &Renderer) {
    renderer.clear(&Rect {
      position: Point { x: 0, y: 0 },
      width: 1000,
      height: 600,
    });

    if let WalkTheDog::Loaded(walk) = self {
      walk.backgrounds.iter().for_each(|background| {
        background.draw(renderer);
      });
      walk.boy.draw(renderer);
      walk.obstacles.iter().for_each(|obstacle| {
        obstacle.draw(renderer);
      });
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

      let velocity = walk.velocity();
      walk.backgrounds.iter_mut().for_each(|background| {
        background.move_horizontally(velocity);
        let x = background.bounding_box().position.x;
        let w = background.bounding_box().width;
        if ((x + w) as i16) < 0 {
          background.move_horizontally(w * 2);
        }
      });

      walk.obstacles.retain(|obstacle| obstacle.right() > 0);

      walk.obstacles.iter_mut().for_each(|obstacle| {
        obstacle.move_horizontally(velocity);
        obstacle.check_intersecttion(&mut walk.boy);
      });

      if walk.timeline < TIMELINE_MINIMUN {
        log!("TIMELINE_MINIMUN : {} , timeline : {} ", TIMELINE_MINIMUN, walk.timeline);
        walk.genereate_next_getment();
      } else {
        walk.timeline += velocity;
      }
    }
  }
}

pub trait Obstacle {
  fn check_intersecttion(&self, boy: &mut RedHatBoy);
  fn draw(&self, renderer: &Renderer);
  fn move_horizontally(&mut self, x: i16);
  fn right(&self) -> i16;
}

impl Obstacle for Platform {
  fn draw(&self, renderer: &Renderer) {
    let mut x = 0;
    self.sprites.iter().for_each(|sprite| {
      self.sheet.draw(
        renderer,
        &Rect::new_from_x_y(
          sprite.frame.x,
          sprite.frame.y,
          sprite.frame.w,
          sprite.frame.h,
        ),
        &Rect::new_from_x_y(
          self.position.x + x,
          self.position.y,
          sprite.frame.w,
          sprite.frame.h,
        ),
      );
      x += sprite.frame.w;
    });
  }
  fn move_horizontally(&mut self, distance: i16) {
    self.position.x += distance;
    self.bounding_boxes.iter_mut().for_each(|bounding_box| {
      bounding_box.set_x(bounding_box.position.x + distance);
    });
  }

  fn check_intersecttion(&self, boy: &mut RedHatBoy) {
    if let Some(box_to_land_on) = self
      .bounding_boxes()
      .iter()
      .find(|&bounding_box| boy.bounding_box().intersects(bounding_box))
    {
      if boy.velocity_y() > 0 && boy.pos_y() < self.position.y {
        boy.land_on(box_to_land_on.position.y);
      } else {
        boy.knock_out();
      }
    }
  }

  fn right(&self) -> i16 {
    self
      .bounding_boxes()
      .last()
      .unwrap_or(&Rect::default())
      .right()
  }
}

pub struct Barrier {
  image: Image,
}

impl Barrier {
  pub fn new(image: Image) -> Self {
    Barrier { image }
  }
}

impl Obstacle for Barrier {
  fn check_intersecttion(&self, boy: &mut RedHatBoy) {
    if boy.bounding_box().intersects(self.image.bounding_box()) {
      boy.knock_out();
    }
  }

  fn draw(&self, renderer: &Renderer) {
    self.image.draw(renderer)
  }

  fn move_horizontally(&mut self, x: i16) {
    self.image.move_horizontally(x)
  }

  fn right(&self) -> i16 {
    self.image.right()
  }
}

pub struct Platform {
  pub sheet: Rc<SpriteSheet>,
  pub position: Point,
  pub sprites: Vec<Cell>,
  pub bounding_boxes: Vec<Rect>,
}

impl Platform {
  pub fn new(
    sheet: Rc<SpriteSheet>,
    position: Point,
    sprite_names: &[&str],
    bounding_boxes: &[Rect],
  ) -> Self {
    let sprites = sprite_names
      .iter()
      .filter_map(|sprite_name| sheet.cell(sprite_name).cloned())
      .collect();
    let bounding_boxes = bounding_boxes
      .iter()
      .map(|bounding_box| {
        Rect::new_from_x_y(
          bounding_box.x() + position.x,
          bounding_box.y() + position.y,
          bounding_box.width,
          bounding_box.height,
        )
      })
      .collect();
    Platform {
      sheet,
      position,
      sprites,
      bounding_boxes,
    }
  }

  pub fn bounding_boxes(&self) -> &Vec<Rect> {
    &self.bounding_boxes
  }
}

mod red_hat_boy {
  use super::Sheet;
  use crate::engine::{Cell, Point, Rect, Renderer};
  use web_sys::HtmlImageElement;

  const HEIGHT: i16 = 600;
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
          position: Point {
            x: sprite.frame.x.into(),
            y: sprite.frame.y.into(),
          },
          width: sprite.frame.w.into(),
          height: sprite.frame.h.into(),
        },
        &self.destination_box(),
      );
    }

    pub fn bounding_box(&self) -> Rect {
      const X_OFFSET: i16 = 18;
      const Y_OFFSET: i16 = 14;
      const WIDTH_OFFSET: i16 = 28;
      let mut bounding_box = self.destination_box();
      bounding_box.position.x += X_OFFSET;
      bounding_box.position.y += Y_OFFSET;
      bounding_box.width -= WIDTH_OFFSET;
      bounding_box.height -= Y_OFFSET;
      bounding_box
    }

    pub fn destination_box(&self) -> Rect {
      let sprite = self.current_sprite().expect("Could not found");

      Rect {
        position: Point {
          x: (self.state.context().position.x + sprite.sprite_source_size.x as i16).into(),
          y: (self.state.context().position.y + sprite.sprite_source_size.y as i16).into(),
        },
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

    pub fn land_on(&mut self, position: i16) {
      self.state = self.state.transition(Event::Land(position));
    }

    pub fn velocity_y(&self) -> i16 {
      self.state.context().velocity.y
    }

    pub fn pos_y(&self) -> i16 {
      self.state.context().position.y
    }

    pub fn walking_speed(&self) -> i16 {
      self.state.context().velocity.x
    }
  }

  enum Event {
    Run,
    Slide,
    Update,
    Jump,
    KnockOut,
    Land(i16),
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
        (RedHatBoyStateMachine::Running(state), Event::Slide) => state.slide().into(),
        (RedHatBoyStateMachine::Running(state), Event::Jump) => state.jump().into(),
        (RedHatBoyStateMachine::Running(state), Event::KnockOut) => state.knock_out().into(),
        (RedHatBoyStateMachine::Jumping(state), Event::KnockOut) => state.knock_out().into(),
        (RedHatBoyStateMachine::Sliding(state), Event::KnockOut) => state.knock_out().into(),
        (RedHatBoyStateMachine::Sliding(state), Event::Land(position)) => {
          state.land_on(position).into()
        }
        (RedHatBoyStateMachine::Jumping(state), Event::Land(position)) => {
          state.land_on(position).into()
        }
        (RedHatBoyStateMachine::Running(state), Event::Land(position)) => {
          state.land_on(position).into()
        }
        // Update
        (RedHatBoyStateMachine::Idle(state), Event::Update) => state.update().into(),
        (RedHatBoyStateMachine::Running(state), Event::Update) => state.update().into(),
        (RedHatBoyStateMachine::Sliding(state), Event::Update) => state.update().into(),
        (RedHatBoyStateMachine::Jumping(state), Event::Update) => state.update().into(),
        (RedHatBoyStateMachine::Falling(state), Event::Update) => state.update().into(),
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
      if self.position.y > FLOOR {
        self.velocity.y = 0;
        self.position.y = FLOOR;
      } else {
        self.velocity.y += GRAVITY;
        self.position.y += self.velocity.y;
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

    pub fn land_on(self, position: i16) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self
          .context
          .set_vertical_velocity(0)
          .set_on(position as i16),
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

    pub fn land_on(self, position: i16) -> RedHatBoyState<Sliding> {
      RedHatBoyState {
        context: self
          .context
          .set_vertical_velocity(0)
          .set_on(position as i16),
        _state: Sliding,
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

    pub fn land_on(self, position: i16) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self
          .context
          .reset_frame()
          .set_vertical_velocity(0)
          .set_on(position as i16),
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
}
