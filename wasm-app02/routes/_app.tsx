import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>wasm-app02</title>
        <link href="main.css" rel="stylesheet" />
        <link rel="preload" as="image" href="bu/blue_button00.png" />
        <link rel="preload" as="image" href="bu/green_button00.png" />
        <link rel="preload" as="image" href="bu/grey_button00.png" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
