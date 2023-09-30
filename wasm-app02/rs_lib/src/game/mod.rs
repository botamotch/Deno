mod state;
use crate::browser;
use crate::engine;
use crate::engine::KeyState;
use crate::engine::Point;
use crate::engine::{Game, Rect, Renderer};
use anyhow::Result;
use async_trait::async_trait;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use web_sys::HtmlImageElement;

#[derive(Deserialize)]
struct SheetRect {
  x: i16,
  y: i16,
  w: i16,
  h: i16,
}

#[derive(Deserialize)]
struct Cell {
  frame: SheetRect,
}

#[derive(Deserialize)]
struct Sheet {
  frames: HashMap<String, Cell>,
}

pub struct WalkTheDog {
  image: Option<HtmlImageElement>,
  sheet: Option<Sheet>,
  frame: u8,
  position: Point,
}

impl WalkTheDog {
  pub fn new() -> Self {
    WalkTheDog {
      image: None,
      sheet: None,
      frame: 0,
      position: Point { x: 0, y: 0 },
    }
  }
}

#[async_trait(?Send)]
impl Game for WalkTheDog {
  async fn initilalize(&self) -> Result<Box<dyn Game>> {
    let sheet: Sheet = from_value(browser::fetch_json("rhb.json").await?)
      .expect("Could not convert rhb.json into a Sheet structure");
    let sheet = Some(sheet);
    let image = Some(engine::load_image("rhb.png").await?);

    Ok(Box::new(WalkTheDog {
      image,
      sheet,
      frame: self.frame,
      position: self.position,
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
