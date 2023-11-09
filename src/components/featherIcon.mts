import type FeatherIcons from 'assets/icons/FeatherIcons.mjs'
import featherIcons from 'assets/icons/feather-sprite.svg'
import style from 'lib/style.mjs'

style('feather-icon', `
    .feather-icon {
        stroke: currentColor;
        display: inline-block;
        height: 1em;
        width: 1em;
    }
`)

export default (iconName: FeatherIcons) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    svg.classList.add('feather-icon')
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `${featherIcons}#${iconName}`)
    svg.appendChild(use)

    return svg
}