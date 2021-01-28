import * as builders from "../builders.js"
import { type } from "../data.js"
import { massUnits } from "../helpers.js"

export default class Dockable {
    constructor(craft, field, amount, container) {
        this.craft = craft
        this.field = field
        this.fId = craft.name + field
        this.type = type(field)
        this.value = 0
        this.dockedWith = 'none'
        this.amount = amount
        this.container = container
        this.init(craft, field, container)
    }

    init(craft, field, container) {
        let block = $(`<div id="${this.fId}Dockable" class="flexItem"></div>`).appendTo(container)
        builders.addFlexValue(this.fId, block).text(0)
        let label = (this.type === "sink") ? massUnits(this.amount) : this.amount
        builders.addFlexButton(this.fId, label, block)
            .css("display", "none")
    }

    step(val, dockedWith = null) {
        if (this.type === "sink") val = massUnits(val)

        if (val !== this.value) {

            $(`#${this.fId}Value`).text(val)
            this.value = val
        }

        if (!dockedWith) dockedWith = "none"
        if (dockedWith !== this.dockedWith) {
            let button = $(`#${this.fId}Button`)
            if (dockedWith === "none") {
                button.css("display", "none").off()
            } else {
                button.css("display", "inline").click(() => {
                    this.craft.game.transfer(
                        this.craft.name,
                        dockedWith,
                        this.field,
                        this.amount
                    )
                })
            }
            this.dockedWith = dockedWith
        }
    }
}