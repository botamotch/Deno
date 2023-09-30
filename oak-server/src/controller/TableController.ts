import type { RouterContext as X } from "$oak/router.ts";
// deno-lint-ignore no-explicit-any
type RouterContext = X<any, any, any>;

import * as supabase from "@/src/lib/supabase.ts";

export async function SelectArticles(ctx: RouterContext) {
  const { data, error } = await supabase.SelectArticles();
  if (data) {
    ctx.response.body = Array.from(data);
  }

  if (error) {
    ctx.response.body = Array.from(error.message + error.details);
  }
}
