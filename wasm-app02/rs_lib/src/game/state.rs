use super::Sheet;
use web_sys::HtmlImageElement;

struct RedHatBoy {
  sprite_sheet: Sheet,
  image: HtmlImageElement,
}

#[derive(Copy, Clone)]
enum RedHatBoyStateMachine {
  Idle(RedHatBoyStateMachine<Idle>),
  Running(RedHatBoyStateMachine<Running>),
}

mod red_hat_boy_states {
  use crate::engine::Point;

  #[derive(Copy, Clone)]
  struct Idle;

  #[derive(Copy, Clone)]
  struct Running;

  #[derive(Copy, Clone)]
  pub struct RedHatBoyState<S> {
    context: RedHatBoyContext,
    _state: S,
  }

  #[derive(Copy, Clone)]
  pub struct RedHatBoyContext {
    frame: u8,
    position: Point,
    velocity: Point,
  }

  impl RedHatBoyState<Idle> {
    pub fn run(self) -> RedHatBoyState<Running> {
      RedHatBoyState {
        context: self.context,
        _state: Running {},
      }
    }
  }
}
