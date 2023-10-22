use crate::{
  engine::{Image, Point, Rect, SpriteSheet},
  game::{Barrier, Obstacle, Platform},
};
use std::rc::Rc;
use web_sys::HtmlImageElement;

const STONE_ON_GROUND: i16 = 546;
const FIRST_PLATFORM: i16 = 500;
const LOW_PLATFORM: i16 = 380;
const INITIAL_STONE_OFFSET: i16 = 400;

pub fn stone_and_platform(
  stone: HtmlImageElement,
  sprite_sheet: Rc<SpriteSheet>,
  offset_x: i16,
) -> Vec<Box<dyn Obstacle>> {
  vec![
    Box::new(Barrier::new(Image::new(
      stone,
      Point {
        x: offset_x + INITIAL_STONE_OFFSET,
        y: STONE_ON_GROUND,
      },
    ))),
    Box::new(create_floating_platform(
      sprite_sheet,
      Point {
        x: offset_x + FIRST_PLATFORM,
        y: LOW_PLATFORM,
      },
    )),
  ]
}

pub fn stone(stone: HtmlImageElement, offset_x: i16) -> Vec<Box<dyn Obstacle>> {
  vec![Box::new(Barrier::new(Image::new(
    stone,
    Point {
      x: offset_x + INITIAL_STONE_OFFSET,
      y: STONE_ON_GROUND,
    },
  )))]
}

pub fn platform_high(sprite_sheet: Rc<SpriteSheet>, offset_x: i16) -> Vec<Box<dyn Obstacle>> {
  vec![Box::new(create_floating_platform(
    sprite_sheet,
    Point {
      x: offset_x + FIRST_PLATFORM,
      y: LOW_PLATFORM - 100,
    },
  ))]
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
