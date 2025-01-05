import { SECTION_BUTTONS } from '../../common-client/sources'
import { WebSocketDataSource } from '../../ws-manager/types'

export default class SectionHeader {
  buttons = SECTION_BUTTONS
  addSection: (section: WebSocketDataSource) => void

  constructor({ addSection }: {addSection: (section: WebSocketDataSource) => void}) {
    this.addSection = addSection
  }
}