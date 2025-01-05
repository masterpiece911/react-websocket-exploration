import ko from "knockout";

import viewModel from "./viewModel";
import template from "./template.html?raw";

ko.components.register("ws-data-section", {
  viewModel,
  template,
});

console.log({viewModel, template})