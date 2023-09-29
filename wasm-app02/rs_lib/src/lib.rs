use browser::{canvas, spawn_local};
use engine::GameLoop;
use game::WalkTheDog;
use wasm_bindgen::prelude::*;
use web_sys::console;
#[macro_use]
mod browser;
mod engine;
mod game;
mod test;

// #[allow(dead_code)]
// async fn fetch_json(json_path: &str) -> Result<JsValue, JsValue> {
//   // JavaScriptで書くとこんな感じ？
//   // (await window.fetch(json_path)).json();
//   let window = web_sys::window().unwrap();
//   let resp_value =
//     wasm_bindgen_futures::JsFuture::from(window.fetch_with_str(json_path))
//       .await?;
//   let resp: web_sys::Response = resp_value.dyn_into()?;
// 
//   wasm_bindgen_futures::JsFuture::from(resp.json()?).await
// }

#[wasm_bindgen]
pub fn main() {
  let canvas = canvas().expect("");
  canvas.set_width(600);
  canvas.set_height(600);

  spawn_local(async move {
    // test::sierpinski( &context, [(300.0, 0.0), (0.0, 600.0), (600.0, 600.0)], 5, &"rgb(0, 200, 200)");

    let game = WalkTheDog::new();
    GameLoop::start(game)
      .await
      .expect("Could not start game loop");

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
