import "../assets/style.css";
import ko from "knockout"

import "./ws-data-section"
import "./ws-sections-header"

import AppViewModel from './App'

const template = `
  <div id='knockout-root'>
    <ws-sections-header params="
      addSection: $root.addSource
    "></ws-sections-header>

    <div 
      class="section-container"
      data-bind="
        foreach: $root.sources
      "
    >
      <ws-data-section params="
        source: $data,
        onClose: () => $root.removeSource($index())
      "></ws-data-section>
    </div>
  </div>
`

ko.components.register('main', { template })

const context = new AppViewModel()
console.log({context})

ko.applyBindings(context)
