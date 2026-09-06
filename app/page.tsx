"use client";

import dynamic from "next/dynamic";
import { RouterProvider } from "./router";

const Home = dynamic(() => import("./components/home").then((m) => m.Home), {
  ssr: false,
});

export default function App() {
  return (
    <RouterProvider>
      <Home />
    </RouterProvider>
  );
}
