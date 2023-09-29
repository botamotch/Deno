use wasm_bindgen::prelude::*;
use getrandom::getrandom;

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

#[allow(dead_code)]
pub fn sierpinski(
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

