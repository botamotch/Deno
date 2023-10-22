use chrono::Local;
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
mod segment;

#[wasm_bindgen]
pub fn main() {
  let canvas = canvas().expect("");
  canvas.set_width(1000);
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

#[wasm_bindgen]
pub fn hello() {
  console::log_1(&JsValue::from_str(&format!("Hello World from wasm! : {}", Local::now())));
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
