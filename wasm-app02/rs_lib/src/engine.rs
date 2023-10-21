use crate::browser::LoopClosure;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use futures::channel::mpsc::{unbounded, UnboundedReceiver};
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlImageElement};

use crate::browser;

#[derive(Clone, Copy)]
pub struct Point {
  pub x: i16,
  pub y: i16,
}

#[derive(Deserialize, Clone)]
pub struct SheetRect {
  pub x: i16,
  pub y: i16,
  pub w: i16,
  pub h: i16,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Cell {
  pub frame: SheetRect,
  pub sprite_source_size: SheetRect,
}

#[derive(Deserialize, Clone)]
pub struct Sheet {
  pub frames: HashMap<String, Cell>,
}

pub struct Image {
  element: HtmlImageElement,
  position: Point,
  bounding_box: Rect,
}

impl Image {
  pub fn new(element: HtmlImageElement, position: Point) -> Self {
    let bounding_box = Rect {
      x: position.x.into(),
      y: position.y.into(),
      height: element.height() as f32,
      width: element.width() as f32,
    };
    Self {
      element,
      position,
      bounding_box,
    }
  }

  pub fn draw(&self, renderer: &Renderer) {
    renderer.draw_entire_image(&self.element, &self.position)
  }

  pub fn bounding_box(&self) -> &Rect {
    &self.bounding_box
  }

  pub fn move_horizontally(&mut self, distance: i16) {
    self.set_x(self.position.x + distance);
  }

  pub fn set_x(&mut self, x: i16) {
    self.bounding_box.x = x as f32;
    self.position.x = x;
  }
}

pub async fn load_image(source: &str) -> Result<HtmlImageElement> {
  let image = browser::new_image()?;
  let (complete_tx, complete_rx) = futures::channel::oneshot::channel::<Result<()>>();
  let success_tx = Rc::new(Mutex::new(Some(complete_tx)));
  let error_tx = Rc::clone(&success_tx);
  let success_callback = browser::closure_once(move || {
    if let Some(success_tx) = success_tx.lock().ok().and_then(|mut opt| opt.take()) {
      let _ = success_tx.send(Ok(()));
    }
  });

  let error_callback: Closure<dyn FnMut(JsValue)> = browser::closure_once(move |err| {
    if let Some(error_tx) = error_tx.lock().ok().and_then(|mut opt| opt.take()) {
      let _ = error_tx.send(Err(anyhow!("Error Loading Image: {:#?}", err)));
    }
  });

  image.set_onload(Some(success_callback.as_ref().unchecked_ref()));
  image.set_onerror(Some(error_callback.as_ref().unchecked_ref()));
  image.set_src(source);

  complete_rx.await??;

  // Ok(Image {
  //   element: image,
  //   position: Point {x: 0, y: 0},
  // })
  Ok(image)
}

#[async_trait(?Send)]
pub trait Game {
  fn update(&mut self, keystate: &KeyState);
  fn draw(&self, renderer: &Renderer);
  async fn initilalize(&self) -> Result<Box<dyn Game>>;
}

const FRAME_SIZE: f32 = 1.0 / 60.0 * 1000.0;

pub struct GameLoop {
  last_frame: f64,
  accumulated_delta: f32,
}

type SharedLoopClosure = Rc<RefCell<Option<LoopClosure>>>;

impl GameLoop {
  pub async fn start(game: impl Game + 'static) -> Result<()> {
    let mut keyevent_reciever = prepare_input()?;
    let mut game = game.initilalize().await?;
    let mut game_loop = GameLoop {
      last_frame: browser::now()?,
      accumulated_delta: 0.0,
    };

    let f: SharedLoopClosure = Rc::new(RefCell::new(None));
    let g = f.clone();

    let renderer = Renderer {
      context: browser::context()?,
    };

    let mut keystate = KeyState::new();
    *g.borrow_mut() = Some(browser::create_raf_closure(move |pref: f64| {
      process_input(&mut keystate, &mut keyevent_reciever);
      game_loop.accumulated_delta += (pref - game_loop.last_frame) as f32;
      while game_loop.accumulated_delta > FRAME_SIZE {
        game.update(&keystate);
        game_loop.accumulated_delta -= FRAME_SIZE;
      }
      game_loop.last_frame = pref;
      game.draw(&renderer);

      let _ = browser::request_animation_frame(f.borrow().as_ref().unwrap());
    }));

    browser::request_animation_frame(
      g.borrow()
        .as_ref()
        .ok_or_else(|| anyhow!("GameLoop: Loop is None"))?,
    )?;
    Ok(())
  }
}
pub struct Renderer {
  context: CanvasRenderingContext2d,
}

pub struct Rect {
  pub x: f32,
  pub y: f32,
  pub width: f32,
  pub height: f32,
}

impl Rect {
  pub fn intersects(&self, rect: &Rect) -> bool {
    self.x < (rect.x + rect.width)
      && (self.x + self.width) > rect.x
      && self.y < (rect.y + rect.height)
      && (self.y + self.height) > rect.y
  }
}

impl Renderer {
  pub fn clear(&self, rect: &Rect) {
    self.context.clear_rect(
      rect.x.into(),
      rect.y.into(),
      rect.width.into(),
      rect.height.into(),
    )
  }

  pub fn draw_image(&self, image: &HtmlImageElement, frame: &Rect, destination: &Rect) {
    let _ = self
      .context
      .draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
        &image,
        frame.x.into(),
        frame.y.into(),
        frame.width.into(),
        frame.height.into(),
        destination.x.into(),
        destination.y.into(),
        destination.width.into(),
        destination.height.into(),
      )
      .expect("Drawing is throwing expections!");
  }

  pub fn draw_entire_image(&self, image: &HtmlImageElement, position: &Point) {
    self
      .context
      .draw_image_with_html_image_element(image, position.x.into(), position.y.into())
      .expect("Drawing is throwing expections! Unrecoverable error.");
  }
}

pub struct KeyState {
  pressed_keys: HashMap<String, web_sys::KeyboardEvent>,
}

impl KeyState {
  fn new() -> Self {
    KeyState {
      pressed_keys: HashMap::new(),
    }
  }

  pub fn is_pressed(&self, code: &str) -> bool {
    self.pressed_keys.contains_key(code)
  }

  fn set_pressed(&mut self, code: &str, event: web_sys::KeyboardEvent) {
    self.pressed_keys.insert(code.into(), event);
  }

  fn set_released(&mut self, code: &str) {
    self.pressed_keys.remove(code.into());
  }
}

enum KeyPress {
  KeyUp(web_sys::KeyboardEvent),
  KeyDown(web_sys::KeyboardEvent),
}

fn prepare_input() -> Result<UnboundedReceiver<KeyPress>> {
  let (keydown_sender, keyevent_reciever) = unbounded();
  let keydown_sender = Rc::new(RefCell::new(keydown_sender));
  let keyup_sender = Rc::clone(&keydown_sender);

  let onkeydown = browser::closure_wrap(Box::new(move |keycode: web_sys::KeyboardEvent| {
    let _ = keydown_sender
      .borrow_mut()
      .start_send(KeyPress::KeyDown(keycode));
  }) as Box<dyn FnMut(web_sys::KeyboardEvent)>);
  let onkeyup = browser::closure_wrap(Box::new(move |keycode: web_sys::KeyboardEvent| {
    let _ = keyup_sender
      .borrow_mut()
      .start_send(KeyPress::KeyUp(keycode));
  }) as Box<dyn FnMut(web_sys::KeyboardEvent)>);

  browser::window()?.set_onkeydown(Some(onkeydown.as_ref().unchecked_ref()));
  browser::window()?.set_onkeyup(Some(onkeyup.as_ref().unchecked_ref()));

  onkeydown.forget();
  onkeyup.forget();
  Ok(keyevent_reciever)
}

fn process_input(state: &mut KeyState, keyevent_reciever: &mut UnboundedReceiver<KeyPress>) {
  loop {
    match keyevent_reciever.try_next() {
      Ok(None) => break,
      Err(_err) => break,
      Ok(Some(evt)) => match evt {
        KeyPress::KeyUp(evt) => state.set_released(&evt.code()),
        KeyPress::KeyDown(evt) => state.set_pressed(&evt.code(), evt),
      },
    }
  }
}
