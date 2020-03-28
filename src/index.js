import { dom, hook, renderer, syntheticEvents } from "rolled";
const { addEventListener, setupSyntheticEvent } = syntheticEvents;
const { fragment, h } = dom;
const { render } = renderer;
const { c, useGlobalHook } = hook;

const todoMockData = [
    {
        checked: true,
        title: "title",
        content: "content"
    },
    {
        checked: false,
        title: "foo",
        content: "bar"
    }
];

setupSyntheticEvent("change");
setupSyntheticEvent("submit");

useGlobalHook((context) => ({
    useTodoChannel: (onObserve, __initValue = []) => {
        return context.useChannel("todo", __initValue, onObserve);
    },
    todoChildMount: (refName, Component) => {
        const [items, setItems] = context.useState([]);
        context.useTodoChannel((response) => {
            setItems(response);
        });
        context.useEffect(() => {
            context.reactiveMount(
                refName,
                items.value.map((item, nth) => {
                    return c(
                        (props, ownedContext) => {
                            ownedContext.useHook(() => ({
                                dispatchItem: (item) => {
                                    const cloned = [...items.valueOf()];
                                    cloned.splice(nth, 1, item);
                                    setItems(cloned);
                                }
                            }));
                            return Component(props, ownedContext);
                        },
                        { ...item },
                        []
                    );
                })
            );
        }, [items]);
    }
}));
const TodoContainer = (props, { useEffect, useTodoChannel }) => {
    const [items, setToto] = useTodoChannel();
    useEffect(() => {
        setToto(todoMockData);
    }, []);
    return h`
    <section>
        <h1>todoList</h1>
        <section>
            #children
        </section>
    </section>`;
};
const TodoItem = (props, { dispatchItem }) => {
    const $dom = h`<li>
        <input type="checkbox" #checkbox>
        <span>#title</span>/<span>#content</span>
        <div>#children</div>
    </li>`;
    const { checkbox } = $dom.collect($dom);
    checkbox.checked = props.checked;
    addEventListener(checkbox, "change", (e) => {
        props.checked = checkbox.checked;
        dispatchItem(props);
    });
    return $dom;
};
const todoItems = (props, { todoChildMount }) => {
    todoChildMount("itemRef", TodoItem);
    return h`<ul #itemRef></ul>`;
};
const todoInsertForm = (props, { useTodoChannel }) => {
    const [items, setToto] = useTodoChannel();
    const $dom = h`<form #form>
        <p><input type="text" #title value="test"/></p>
        <p>
            <textarea name="" id="" cols="30" rows="10" col="30" row="30" #content>test</textarea>
        </p>
        <p>완료여부: <input type="checkbox" #checkbox/></p>
        <p>
            <button type="submit">쓰기!</button>
        </p>
        <div>#children</div>
    </form>`;
    const { form, title, content, checkbox } = $dom.collect($dom);
    addEventListener(form, "submit", (e) => {
        e.preventDefault();
        items.value.push({
            title: title.value,
            content: content.value,
            checked: checkbox.checked
        });
        setToto([...items.value]);
    });

    return $dom;
};
render(
    document.getElementById("app"),
    c(TodoContainer, {}, [c(todoItems, {}, []), c(todoInsertForm, {}, [])])
);
