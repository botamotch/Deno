use crate::browser;
use crate::engine;
use crate::engine::KeyState;
use crate::engine::Point;
use crate::engine::{Game, Rect, Renderer};
use anyhow::anyhow;
use anyhow::Result;
use async_trait::async_trait;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use web_sys::HtmlImageElement;

#[derive(Deserialize, Clone)]
struct SheetRect {
  x: i16,
  y: i16,
  w: i16,
  h: i16,
}

#[derive(Deserialize, Clone)]
struct Cell {
  frame: SheetRect,
}

#[derive(Deserialize, Clone)]
pub struct Sheet {
  frames: HashMap<String, Cell>,
}

pub struct WalkTheDog {
  image: Option<HtmlImageElement>,
  sheet: Option<Sheet>,
  frame: u8,
  position: Point,
  rhb: Option<RedHatBoy>,
}

impl WalkTheDog {
  pub fn new() -> Self {
    WalkTheDog {
      image: None,
      sheet: None,
      frame: 0,
      position: Point { x: 0, y: 0 },
      rhb: None,
    }
  }
}

#[async_trait(?Send)]
impl Game for WalkTheDog {
  async fn initilalize(&self) -> Result<Box<dyn Game>> {
    let sheet: Sheet = from_value(browser::fetch_json("rhb.json").await?)
      .expect("Could not convert rhb.json into a Sheet structure");
    let sheet: Option<Sheet> = Some(sheet);
    let image = Some(engine::load_image("rhb.png").await?);

    Ok(Box::new(WalkTheDog {
      image: image.clone(),
      sheet: sheet.clone(),
      frame: self.frame,
      position: self.position,
      rhb: Some(RedHatBoy::new(
        sheet.clone().ok_or_else(|| anyhow!("No Sheet Present"))?,
        image.clone().ok_or_else(|| anyhow!("No Image Present"))?,
      )),
    }))
  }
  fn draw(&self, renderer: &Renderer) {
    let current_sprite = (self.frame / 3) + 1;
    let frame_name = format!("Run ({}).png", current_sprite);
    let sprite = self
      .sheet
      .as_ref()
      .and_then(|sheet| sheet.frames.get(&frame_name))
      .expect("Cell not found");

    renderer.clear(&Rect {
      x: 0.0,
      y: 0.0,
      width: 600.0,
      height: 600.0,
    });

    self.image.as_ref().map(|image| {
      renderer.draw_image(
        &image,
        &Rect {
          x: sprite.frame.x.into(),
          y: sprite.frame.y.into(),
          width: sprite.frame.w.into(),
          height: sprite.frame.h.into(),
        },
        &Rect {
          x: self.position.x.into(),
          y: self.position.y.into(),
          width: sprite.frame.w.into(),
          height: sprite.frame.h.into(),
        },
      );
    });
    self.rhb.as_ref().unwrap().draw(renderer);
  }

  fn update(&mut self, keystate: &KeyState) {
    const SPEED_WALK: i16 = 5;
    let mut velocity = Point { x: 0, y: 0 };
    if keystate.is_pressed("ArrowDown") {
      velocity.y += SPEED_WALK;
    }

    if keystate.is_pressed("ArrowUp") {
      velocity.y -= SPEED_WALK;
    }

    if keystate.is_pressed("ArrowRight") {
      velocity.x += SPEED_WALK;
    }

    if keystate.is_pressed("ArrowLeft") {
      velocity.x -= 5;
    }

    if self.position.x > 600 {
      self.position.x = 0;
    } else if self.position.x < 0 {
      self.position.x = 600;
    } else {
      self.position.x += velocity.x;
    }

    if self.position.y > 600 {
      self.position.y = 0;
    } else if self.position.y < 0 {
      self.position.y = 600;
    } else {
      self.position.y += velocity.y;
    }

    if self.frame < 23 {
      self.frame += 1;
    } else {
      self.frame = 0;
    }
  }
}

const FLOOR: i16 = 475;
const FRAME_NAME_IDLE: &str = "Idle";
const FRAME_NAME_RUN: &str = "Run";

struct RedHatBoy {
  state: RedHatBoyStateMachine,
  sprite_sheet: Sheet,
  image: HtmlImageElement,
}

impl RedHatBoy {
  fn new(sheet: Sheet, image: HtmlImageElement) -> Self {
    RedHatBoy {
      state: RedHatBoyStateMachine::Idle(RedHatBoyState::new()),
      sprite_sheet: sheet,
      image,
    }
  }

  fn draw(&self, renderer: &Renderer) {
    let frame_name = format!(
      "{} ({}).png",
      self.state.frame_name(),
      (self.state.context().frame / 3) + 1,
    );
    let sprite = self
      .sprite_sheet
      .frames
      .get(&frame_name)
      .expect("Could not found");

    renderer.draw_image(
      &self.image,
      &Rect {
        x: sprite.frame.x.into(),
        y: sprite.frame.y.into(),
        width: sprite.frame.w.into(),
        height: sprite.frame.h.into(),
      },
      &Rect {
        x: self.state.context().position.x.into(),
        y: self.state.context().position.y.into(),
        width: sprite.frame.w.into(),
        height: sprite.frame.h.into(),
      },
    );
  }
}

enum Event {
  Run,
}

#[derive(Copy, Clone)]
enum RedHatBoyStateMachine {
  Idle(RedHatBoyState<Idle>),
  Running(RedHatBoyState<Running>),
}

impl RedHatBoyStateMachine {
  fn transition(self, event: Event) -> Self {
    match (self, event) {
      (RedHatBoyStateMachine::Idle(state), Event::Run) => state.run().into(),
      _ => self,
    }
  }
  fn frame_name(&self) -> &str {
    match self {
      RedHatBoyStateMachine::Idle(state) => state.frame_name(),
      RedHatBoyStateMachine::Running(state) => state.frame_name(),
    }
  }

  fn context(&self) -> &RedHatBoyContext {
    match self {
      RedHatBoyStateMachine::Idle(state) => &state.context,
      RedHatBoyStateMachine::Running(state) => &state.context,
    }
  }
}

impl From<RedHatBoyState<Running>> for RedHatBoyStateMachine {
  fn from(state: RedHatBoyState<Running>) -> Self {
    RedHatBoyStateMachine::Running(state)
  }
}

#[derive(Copy, Clone)]
struct Idle;

#[derive(Copy, Clone)]
struct Running;

#[derive(Copy, Clone)]
struct RedHatBoyState<S> {
  context: RedHatBoyContext,
  _state: S,
}

impl<S> RedHatBoyState<S> {
  pub fn context(&self) -> &RedHatBoyContext {
    &self.context
  }
}

#[derive(Copy, Clone)]
struct RedHatBoyContext {
  frame: u8,
  position: Point,
  velocity: Point,
}

impl RedHatBoyState<Idle> {
  fn new() -> Self {
    RedHatBoyState {
      context: RedHatBoyContext {
        frame: 0,
        position: Point { x: 0, y: FLOOR },
        velocity: Point { x: 0, y: 0 },
      },
      _state: Idle {},
    }
  }

  fn run(self) -> RedHatBoyState<Running> {
    RedHatBoyState {
      context: self.context,
      _state: Running {},
    }
  }

  fn frame_name(&self) -> &str {
    FRAME_NAME_IDLE
  }
}

impl RedHatBoyState<Running> {
  fn frame_name(&self) -> &str {
    FRAME_NAME_RUN
  }
}
