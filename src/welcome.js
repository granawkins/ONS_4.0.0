export default function welcome(play) {
    
    let container = document.getElementById("welcome")

    $(`<h1 style="text-align: center;">O'Neill Sim</h1>`).appendTo(container)

    let buttonCluster = $(`<div style="text-align: center;"></div>`)
        .appendTo($(container))

    $(`<button>Sandbox</button>`)
        .appendTo(buttonCluster)
        .click(function() {
            container.style = "display: none;"
            play('sandbox')
        })
    $(`<i>  </i>`).appendTo(buttonCluster)
    $(`<button>Tutorial (Recommended)</button>`)
    .appendTo(buttonCluster)
    .click(function() {
        container.style = "display: none;"
        play('tutorial')
    })
    .css("border", "2px solid black")

    $(`</br>`).appendTo(container)

    let about = $(`<div style="display: none;"></div>`)
    let info = $(`<p><u>About</u></p>`)
        .css({
            "text-align": "center",
            "cursor": "pointer",
        })
        .click(function() {
            about.slideToggle()
            let topMargin = ($(`#welcome`).css("margin-top") === '-77.5px') ? '-200px' : `-77.5px`
            $(`#welcome`).css("margin-top", topMargin)
        })
    info.appendTo(container)
    about.appendTo(container)
    
    about.html(`
    <p>
    O'Neill Sim is a minimalist space clicker inspired by <a href="https://www.decisionproblem.com/paperclips/">Universal Paperclips</a>.
    </br></br>
    The story is based on 
    <a href="http://large.stanford.edu/courses/2016/ph240/martelaro2/docs/nasa-sp-413.pdf">
    Space Settlements: A Design Study</a>, a 1975 NASA symposium at Stanford University 
    led by Girard K. O'Neill to investigate the feasibility of colonizing near-earth space.
    </br></br>
    This is a solo project by 
    <a href="https://twitter.com/granawkins">@granawkins</a>, and <b>it is a work in progress</b>. Updates are
    posted regularly, and you can track the progress 
    <a href="https://www.youtube.com/user/granthawkins88/featured">here</a>.
    </p>
    `)

    $(`#welcome`).css("margin-top", - $(`#welcome`)[0].offsetHeight / 2)

}