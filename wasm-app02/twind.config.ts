import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      backgroundImage: {
        button: "url('ui/blue_button00.png')",
        buttonHover: "url('ui/green_button00.png')",
        buttonClicked: "url('ui/yellow_button00.png')",
      },
      fontFamily: {
        kenney: ["Kenney"],
      }
    },
  },
} as Options;
