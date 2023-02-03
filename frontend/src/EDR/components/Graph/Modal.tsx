import React, {ReactNode} from "react";
import {Button, Modal} from "flowbite-react";

export type GraphModalProps = {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export const GraphModal: React.FC<GraphModalProps> = ({children, isOpen, onClose}) => (
    <Modal className="z-50" position="bottom-center" show={isOpen}  size="9xl" onClose={onClose} style={{zIndex: 999999}}>
        <Modal.Header>
            <div className="flex justify-between w-full">
                <span>Dispatcher Graph (Beta)</span>
                <Button size="xs" className="ml-8" onClick={() => {
                    window.open(document.URL + "?graphFullScreenMode=1", "_blank")
                }}>Open in new window</Button>
            </div>
        </Modal.Header>
        <Modal.Body className="h-[600px]">
            {children}
        </Modal.Body>
    </Modal>
)
