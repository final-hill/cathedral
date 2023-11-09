export default ({ title }: { title?: string }, content: HTMLElement[]) => {
    document.title = title || 'Untitled';

    for (const element of content) {
        document.body.appendChild(element);
    }
}