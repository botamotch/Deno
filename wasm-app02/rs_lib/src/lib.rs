use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn main() {
  let window = web_sys::window().unwrap();
  let document = window.document().unwrap();
  let canvas = document
      .get_element_by_id("canvas")
      .unwrap()
      .dyn_into::<web_sys::HtmlCanvasElement>()
      .unwrap();

  console::log_1(&JsValue::from_str("Hello World from wasm window set!"));
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
