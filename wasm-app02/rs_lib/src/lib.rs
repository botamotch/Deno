use getrandom::getrandom;
use std::rc::Rc;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_sys::console;

fn sierpinski(
  context: &web_sys::CanvasRenderingContext2d,
  points: [(f64, f64); 3],
  depth: u8,
  color_str_next: &str,
) {
  fn midpoint(point_0: (f64, f64), point_1: (f64, f64)) -> (f64, f64) {
    return ((point_0.0 + point_1.0) * 0.5, (point_0.1 + point_1.1) * 0.5);
  }
  if depth == 0 {
    return;
  } else {
    draw_triangle(context, points, &color_str_next);

    let [top, left, right] = points;
    let p1 = [
      midpoint(top, top),
      midpoint(top, left),
      midpoint(top, right),
    ];
    let p2 = [
      midpoint(left, top),
      midpoint(left, left),
      midpoint(left, right),
    ];
    let p3 = [
      midpoint(right, top),
      midpoint(right, left),
      midpoint(right, right),
    ];

    let mut color: [u8; 3] = [0, 0, 0];
    getrandom(&mut color).unwrap();
    let color_str = format!("rgb({}, {}, {})", color[0], color[1], color[2]);

    sierpinski(context, p1, depth - 1, &color_str);
    sierpinski(context, p2, depth - 1, &color_str);
    sierpinski(context, p3, depth - 1, &color_str);
  }
}

fn draw_triangle(
  context: &web_sys::CanvasRenderingContext2d,
  points: [(f64, f64); 3],
  color_str: &str,
) {
  let [top, left, right] = points;
  context.move_to(top.0, top.1);
  context.begin_path();
  context.line_to(left.0, left.1);
  context.line_to(right.0, right.1);
  context.line_to(top.0, top.1);
  context.close_path();
  context.stroke();
  context.set_fill_style(&wasm_bindgen::JsValue::from_str(&color_str));
  context.fill();
}

#[wasm_bindgen]
pub fn main() {
  wasm_bindgen_futures::spawn_local(async move {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();
    let canvas = document
      .get_element_by_id("canvas1")
      .unwrap()
      .dyn_into::<web_sys::HtmlCanvasElement>()
      .unwrap();

    canvas.set_width(600);
    canvas.set_height(600);

    let context = canvas
      .get_context("2d")
      .unwrap()
      .unwrap()
      .dyn_into::<web_sys::CanvasRenderingContext2d>()
      .unwrap();

    sierpinski(
      &context,
      [(300.0, 0.0), (0.0, 600.0), (600.0, 600.0)],
      5,
      &"rgb(0, 200, 200)",
    );

    let (success_tx, success_rx) =
      futures::channel::oneshot::channel::<Result<(), JsValue>>();
    let success_tx = Rc::new(Mutex::new(Some(success_tx)));
    let error_tx = Rc::clone(&success_tx);
    let image = web_sys::HtmlImageElement::new().unwrap();
    let callback = Closure::once(move || {
      if let Some(success_tx) =
        success_tx.lock().ok().and_then(|mut opt| opt.take())
      {
        let _ = success_tx.send(Ok(()));
      }
      web_sys::console::log_1(&JsValue::from_str("image load success"));
    });
    let callback_error = Closure::once(move |err| {
      if let Some(error_tx) =
        error_tx.lock().ok().and_then(|mut opt| opt.take())
      {
        let _ = error_tx.send(Err(err));
      }
      web_sys::console::log_1(&JsValue::from_str("image load error"));
    });
    image.set_onload(Some(callback.as_ref().unchecked_ref()));
    image.set_onerror(Some(callback_error.as_ref().unchecked_ref()));

    image.set_src("resized/rhb/Idle (1).png");
    let _ = success_rx.await;
    let _ = context.draw_image_with_html_image_element(&image, 0.0, 0.0);
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
