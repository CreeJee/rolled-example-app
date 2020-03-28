import { dom, hook, renderer, syntheticEvents } from "rolled";
const { addEventListener } = syntheticEvents;
const { fragment, h } = dom;
const { render } = renderer;
const { c, useGlobalHook, reactiveMount } = hook;
const TodoItem = (props, { useState, useEffect }) => {
    const $dom = h`<div>
        <input type="checkbox" checked="#checked" #checkbox>
        <span>#title</span>
        <span>#content</span>
        <div>#children</div>
    </div>`;
    const { checkbox } = $dom.collect($dom);
    checkbox.checked = props.checked;
    return $dom;
};
render(
    document.getElementById("app"),
    c(TodoItem, { checked: true, title: "foo", content: "bar" }, [])
);
