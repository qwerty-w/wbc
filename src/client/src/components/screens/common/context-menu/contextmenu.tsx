import React from "react";
import './contextmenu.css'

export { type IContextMenuPos, type IContextMenuAction, ContextMenu }

interface IContextMenuPos {
    top: number,
    left: number
}

interface IContextMenuAction {
    name: string,
    handler: CallableFunction
}

interface IContextMenuProps {
    pos: IContextMenuPos,
    actions: Array<IContextMenuAction>,
    children: never[]
}

function ContextMenuAction(action: IContextMenuAction) {
    return (
        <li><span>{action.name}</span></li>
    )
}

function ContextMenu({ pos, actions }: IContextMenuProps) {
    return (
        <div className="contextmenu" style={{top: pos.top, left: pos.left}}>
            <ul>
                { actions.map((action) => ContextMenuAction(action)) }
            </ul>
        </div>
    )
}
