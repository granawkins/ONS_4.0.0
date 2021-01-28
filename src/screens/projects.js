import { data } from "../data.js"
import { massUnits } from "../helpers.js"

export default function renderProjects (craft) {

    if (!craft.flags.projectsInitialized || craft.flags.refreshProjects) {
        craft.memory.projects = []
        
        let projects = $(`#${craft.name}Projects`)
        projects.empty()
        
        $(`<div class="sectionHeader">PROJECTS</div>`).appendTo(projects)
        
        craft.projects.forEach(project => {
            let container = $(`<button class="project" id=${project} href=#></button>`)
                .appendTo(projects)
                .addClass('faded')
            
            $(`<h3>${data(project).label}</h3>`).appendTo(container)
            $(`<p>${data(project).description}</p>`).appendTo(container)
            
            let addCost = (label, amount) => $(`<i>${label}: ${amount}</i>`).appendTo(container)
            
            let count = 0
            let before = ""
            data(project).cost.forEach(field => {
                if (field[0] === "labor") {
                    if (count !== 0) before = ", "
                    addCost(before + "Labor", field[1])
                    count ++
                } else {
                    if (count !== 0) before = ", "
                    addCost(before + field[0], massUnits(field[1]))
                    count ++
                }
            })
            
            craft.memory.projects.push({
                id: project,
                cost: data(project).cost.slice(),
                enough: false,
            })
        })
        
        craft.flags.refreshProjects = false
        craft.flags.projectsInitialized = true
    }

    craft.memory.projects.forEach(project => {
        let enough = true
        project.cost.forEach(cost => {
            if (craft.field(cost[0]) < cost[1]) enough = false
        })
        if (enough && !project.enough) {

            // CLICK FUNCTION
            $(`#${project.id}`).removeClass('faded').click(function() {

                // Update proejcts list
                let newProjects = craft.projects.filter(p => p !== project.id)
                craft.projects = newProjects
                craft.flags.refreshProjects = true

                // Subtract cost
                project.cost.forEach(cost => {
                    craft.increment(cost[0], -cost[1])
                })

                // Trigger Effect
                data(project.id).effect(craft)
            })
            project.enough = true

        } else if (!enough && project.enough) {
            $(`#${project.id}`).addClass('faded').off()
            project.enough = false
        }
    })

}