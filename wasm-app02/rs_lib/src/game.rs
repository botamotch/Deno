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
  // image: Option<HtmlImageElement>,
  // sheet: Option<Sheet>,
  frame: u8,
  position: Point,
  rhb: Option<red_hat_boy::RedHatBoy>,
}

impl WalkTheDog {
  pub fn new() -> Self {
    WalkTheDog {
      // image: None,
      // sheet: None,
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
      // image: image.clone(),
      // sheet: sheet.clone(),
      frame: self.frame,
      position: self.position,
      rhb: Some(red_hat_boy::RedHatBoy::new(
        sheet.clone().ok_or_else(|| anyhow!("No Sheet Present"))?,
        image.clone().ok_or_else(|| anyhow!("No Image Present"))?,
      )),
    }))
  }
  fn draw(&self, renderer: &Renderer) {
    renderer.clear(&Rect {
      x: 0.0,
      y: 0.0,
      width: 600.0,
      height: 600.0,
    });

    // let current_sprite = (self.frame / 3) + 1;
    // let frame_name = format!("Run ({}).png", current_sprite);
    // let sprite = self
    //   .sheet
    //   .as_ref()
    //   .and_then(|sheet| sheet.frames.get(&frame_name))
    //   .expect("Cell not found");

    // self.image.as_ref().map(|image| {
    //   renderer.draw_image(
    //     &image,
    //     &Rect {
    //       x: sprite.frame.x.into(),
    //       y: sprite.frame.y.into(),
    //       width: sprite.frame.w.into(),
    //       height: sprite.frame.h.into(),
    //     },
    //     &Rect {
    //       x: self.position.x.into(),
    //       y: self.position.y.into(),
    //       width: sprite.frame.w.into(),
    //       height: sprite.frame.h.into(),
    //     },
    //   );
    // });

    self.rhb.as_ref().unwrap().draw(renderer);
  }

  fn update(&mut self, keystate: &KeyState) {
    // const SPEED_WALK: i16 = 5;
    // let mut velocity = Point { x: 0, y: 0 };
    // if keystate.is_pressed("ArrowDown") {
    //   velocity.y += SPEED_WALK;
    // }

    // if keystate.is_pressed("ArrowUp") {
    //   velocity.y -= SPEED_WALK;
    // }

    if keystate.is_pressed("ArrowRight") {
      // velocity.x += SPEED_WALK;
      self.rhb.as_mut().unwrap().run_right();
    }

    // if keystate.is_pressed("ArrowLeft") {
    //   velocity.x -= 5;
    // }

    // if self.position.x > 600 {
    //   self.position.x = 0;
    // } else if self.position.x < 0 {
    //   self.position.x = 600;
    // } else {
    //   self.position.x += velocity.x;
    // }

    // if self.position.y > 600 {
    //   self.position.y = 0;
    // } else if self.position.y < 0 {
    //   self.position.y = 600;
    // } else {
    //   self.position.y += velocity.y;
    // }

    // if self.frame < 23 {
    //   self.frame += 1;
    // } else {
    //   self.frame = 0;
    // }
    self.rhb.as_mut().unwrap().update();
  }
}

mod red_hat_boy {
  use super::Sheet;
  use crate::engine::{Point, Rect, Renderer};
  use web_sys::HtmlImageElement;

  const FLOOR: i16 = 475;
  const FRAME_NAME_IDLE: &str = "Idle";
  const FRAME_NAME_RUN: &str = "Run";
  const FRAMES_IDLE: u8 = 29;
  const FRAMES_RUN: u8 = 23;
  const RUNNING_SPEED: i16 = 5;

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

    pub fn draw(&self, renderer: &Renderer) {
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

    pub fn update(&mut self) {
      self.state = self.state.update();
    }

    pub fn run_right(&mut self) {
      self.state = self.state.transition(Event::Run);
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

    fn update(self) -> Self {
      match self {
        RedHatBoyStateMachine::Idle(mut state) => {
          state.update();
          RedHatBoyStateMachine::Idle(state)
        }
        RedHatBoyStateMachine::Running(mut state) => {
          state.update();
          RedHatBoyStateMachine::Running(state)
        }
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
      self.position.x += self.velocity.x;
      self.position.y += self.velocity.y;
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
        context: self.context.reset_frame().run_right(),
        _state: Running {},
      }
    }

    fn frame_name(&self) -> &str {
      FRAME_NAME_IDLE
    }

    fn update(&mut self) {
      self.context = self.context.update(FRAMES_IDLE);
    }
  }

  impl RedHatBoyState<Running> {
    fn frame_name(&self) -> &str {
      FRAME_NAME_RUN
    }

    fn update(&mut self) {
      self.context = self.context.update(FRAMES_RUN);
    }
  }
}
