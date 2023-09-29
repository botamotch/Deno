use crate::browser::LoopClosure;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlImageElement};

use crate::browser;

pub async fn load_image(source: &str) -> Result<HtmlImageElement> {
  let image = browser::new_image()?;
  let (complete_tx, complete_rx) =
    futures::channel::oneshot::channel::<Result<()>>();
  let success_tx = Rc::new(Mutex::new(Some(complete_tx)));
  let error_tx = Rc::clone(&success_tx);
  let success_callback = browser::closure_once(move || {
    if let Some(success_tx) =
      success_tx.lock().ok().and_then(|mut opt| opt.take())
    {
      let _ = success_tx.send(Ok(()));
    }
  });

  let error_callback: Closure<dyn FnMut(JsValue)> =
    browser::closure_once(move |err| {
      if let Some(error_tx) =
        error_tx.lock().ok().and_then(|mut opt| opt.take())
      {
        let _ = error_tx.send(Err(anyhow!("Error Loading Image: {:#?}", err)));
      }
    });

  image.set_onload(Some(success_callback.as_ref().unchecked_ref()));
  image.set_onerror(Some(error_callback.as_ref().unchecked_ref()));
  image.set_src(source);

  complete_rx.await??;

  Ok(image)
}

#[async_trait(?Send)]
pub trait Game {
  fn update(&mut self);
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

    *g.borrow_mut() = Some(browser::create_raf_closure(move |pref: f64| {
      game_loop.accumulated_delta += (pref - game_loop.last_frame) as f32;
      while game_loop.accumulated_delta > FRAME_SIZE {
        game.update();
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

impl Renderer {
  pub fn clear(&self, rect: &Rect) {
    self.context.clear_rect(
      rect.x.into(),
      rect.y.into(),
      rect.width.into(),
      rect.height.into(),
    )
  }

  pub fn draw_image(
    &self,
    image: &HtmlImageElement,
    frame: &Rect,
    destination: &Rect,
  ) {
    let _ = self.context
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
}
