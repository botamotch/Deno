use crate::{
  engine::{Image, Point, Rect, SpriteSheet},
  game::{Barrier, Obstacle, Platform},
};
use rand::prelude::*;
use std::rc::Rc;
use web_sys::HtmlImageElement;

const STONE_ON_GROUND: i16 = 546;
const OFFSET_X: i16 = 140;
const LOW_PLATFORM: i16 = 430;

pub fn stone_and_platform(
  stone: HtmlImageElement,
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd_stone = rng.gen_range(0..5);
  let offset_rnd_platform = rng.gen_range(0..5);
  vec![
    Box::new(Barrier::new(Image::new(
      stone,
      Point {
        x: offset_x + OFFSET_X - offset_rnd_stone * 20 + 100,
        y: STONE_ON_GROUND,
      },
    ))),
    Box::new(create_floating_platform(
      sprite_sheet,
      Point {
        x: offset_x + OFFSET_X + 100,
        y: LOW_PLATFORM - offset_rnd_platform * 30,
      },
    )),
  ]
}

pub fn stone_on_platform(
  stone: HtmlImageElement,
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd_platform = rng.gen_range(0..3);
  let platform_y = LOW_PLATFORM - 80 + offset_rnd_platform * 60;
  let platform_x = offset_x + OFFSET_X + 100;
  let stone_y = platform_y - stone.height() as i16;
  vec![
    Box::new(Barrier::new(Image::new(
      stone,
      Point {
        x: platform_x + 150,
        y: stone_y,
      },
    ))),
    Box::new(create_floating_platform(
      sprite_sheet,
      Point {
        x: platform_x,
        y: platform_y,
      },
    )),
  ]
}

pub fn obstacle_stone(
  stone: HtmlImageElement,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd = rng.gen_range(0..3);
  vec![Box::new(Barrier::new(Image::new(
    stone,
    Point {
      x: offset_x + OFFSET_X - offset_rnd * 50 + 100,
      y: STONE_ON_GROUND,
    },
  )))]
}

pub fn platform_high(
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd = rng.gen_range(0..3);
  vec![Box::new(create_floating_platform(
    sprite_sheet,
    Point {
      x: offset_x + OFFSET_X,
      y: LOW_PLATFORM - 80 + offset_rnd * 60,
    },
  ))]
}

pub fn platform_double(
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd = rng.gen_range(2..6);
  vec![
    Box::new(create_floating_platform(
      sprite_sheet.clone(),
      Point {
        x: offset_x + OFFSET_X,
        y: LOW_PLATFORM + 40,
      },
    )),
    Box::new(create_floating_platform(
      sprite_sheet,
      Point {
        x: offset_x + OFFSET_X + 200,
        y: LOW_PLATFORM - offset_rnd * 50 + 20,
      },
    )),
  ]
}

pub fn platform_triple(
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
  rng: &mut ThreadRng,
) -> Vec<Box<dyn Obstacle>> {
  let offset_rnd = rng.gen_range(3..5);
  vec![
    Box::new(create_floating_platform(
      sprite_sheet.clone(),
      Point {
        x: offset_x + OFFSET_X,
        y: LOW_PLATFORM - offset_rnd * 50 + 200,
      },
    )),
    Box::new(create_floating_platform(
      sprite_sheet.clone(),
      Point {
        x: offset_x + OFFSET_X + 200,
        y: LOW_PLATFORM - offset_rnd * 50 + 100,
      },
    )),
    Box::new(create_floating_platform(
      sprite_sheet.clone(),
      Point {
        x: offset_x + OFFSET_X + 400,
        y: LOW_PLATFORM - offset_rnd * 50,
      },
    )),
  ]
}

const FLOATING_PLATFORM_SPRITES: [&str; 3] = ["13.png", "14.png", "15.png"];
const FLOATING_PLATFORM_BOUNDING_BOXES: [Rect; 3] = [
  Rect::new_from_x_y(0, 0, 60, 54),
  Rect::new_from_x_y(60, 0, 384 - (60 * 2), 93),
  Rect::new_from_x_y(384 - 60, 0, 60, 54),
];

fn create_floating_platform(sprite_sheet: Rc<SpriteSheet>, position: Point) -> Platform {
  Platform::new(
    sprite_sheet,
    position,
    &FLOATING_PLATFORM_SPRITES,
    &FLOATING_PLATFORM_BOUNDING_BOXES,
  )
}
