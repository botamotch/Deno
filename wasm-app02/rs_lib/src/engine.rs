use anyhow::{anyhow, Result};
use std::rc::Rc;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_sys::HtmlImageElement;

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
