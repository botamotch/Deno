import type { RouterContext as X } from "$oak/router.ts";
// deno-lint-ignore no-explicit-any
type RouterContext = X<any, any, any>;

interface Book {
  id: string;
  title: string;
  author: string;
}

const books = new Map<string, Book>();

books.set("1", {
  id: "1",
  title: "The Hound of the Baskervilles",
  author: "Conan Doyle, Arthur",
});

export const getAllbooks = (ctx: RouterContext) => {
  ctx.response.body = Array.from(books.values());
};

export const getBookById = (ctx: RouterContext) => {
  if (books.has(ctx?.params?.id)) {
    ctx.response.body = books.get(ctx.params.id);
  }
};
