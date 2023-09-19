use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use web_sys::console;
#[macro_use]
mod browser;
mod test;
mod engine;

#[derive(Deserialize)]
struct Sheet {
  frames: HashMap<String, Cell>,
}

#[derive(Deserialize)]
struct Rect {
  x: u16,
  y: u16,
  w: u16,
  h: u16,
}

#[derive(Deserialize)]
struct Cell {
  frame: Rect,
}

#[allow(dead_code)]
async fn fetch_json(json_path: &str) -> Result<JsValue, JsValue> {
  // JavaScriptで書くとこんな感じ？
  // (await window.fetch(json_path)).json();
  let window = web_sys::window().unwrap();
  let resp_value =
    wasm_bindgen_futures::JsFuture::from(window.fetch_with_str(json_path))
      .await?;
  let resp: web_sys::Response = resp_value.dyn_into()?;

  wasm_bindgen_futures::JsFuture::from(resp.json()?).await
}

#[wasm_bindgen]
pub fn main() {
  // let window = browser::window().expect("No Window Found");
  // let document = browser::document().expect("No Document Found");
  let canvas = browser::canvas().expect("");
  canvas.set_width(600);
  canvas.set_height(600);

  let context = browser::context().expect("Could not get browser context");

  browser::spawn_local(async move {
    // test::sierpinski( &context, [(300.0, 0.0), (0.0, 600.0), (600.0, 600.0)], 5, &"rgb(0, 200, 200)");

    let json = browser::fetch_json("rhb.json")
      .await
      .expect("Could not fetch rhb.json");

    let sheet: Sheet = from_value(json)
      .expect("Could not convert rhb.json into a Sheet structure");

    let image = engine::load_image("rhb.png")
      .await
      .expect("Could not load rhb.png");
    let mut frame = -1;
    let interval_callback = Closure::wrap(Box::new(move || {
      frame = (frame + 1) % 8;
      let frame_name = format!("Run ({}).png", frame + 1);
      context.clear_rect(0.0, 0.0, 600.0, 600.0);
      let sprite = sheet.frames.get(&frame_name).expect("Cell not found");
      let _ = context.draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
        &image,
        sprite.frame.x.into(),
        sprite.frame.y.into(),
        sprite.frame.w.into(),
        sprite.frame.h.into(),
        300.0,
        300.0,
        sprite.frame.w.into(),
        sprite.frame.h.into(),
      );
    }) as Box<dyn FnMut()>);
    let _ = browser::window()
      .unwrap()
      .set_interval_with_callback_and_timeout_and_arguments_0(
        interval_callback.as_ref().unchecked_ref(),
        50,
      );
    interval_callback.forget();

    console::log_1(&JsValue::from_str("Hello World from wasm window set!!!"));
  })
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
  console::log_1(&JsValue::from_str("Hello World from wasm!"));
  return a + b;
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn it_works() {
    let result = add(1, 2);
    assert_eq!(result, 3);
  }
}
