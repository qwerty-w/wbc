const NoneObjects = [null, undefined, '', NaN] as Array<any>

class ValueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValueError';
    }
}
function parseNumber(object: any): number {
    var num = Number(object)
    if (num == NaN || typeof object == 'string' || object instanceof String) {
        return Number((object as string).replace(/[^0-9/.]/g, ''));
    }
    return num;
}
function atSelectHandler(element: HTMLElement, onSelectFunction: Function, onDeselectFunction: Function) {
    element.onclick = (event: Event) => {
        var target = event.currentTarget;
        var states: [string, string] = ['at_selectable', 'at_selected']

        if (!(target instanceof HTMLElement)) {
            return
        }

        if (target.classList.contains(states[0])) {  // selectable -> selected
            target.classList.replace(...states);
            onSelectFunction(target);
        }
        else if (target.classList.contains(states[1])) {  // selected -> selectable
            target.classList.replace(...states.reverse() as [string, string]);
            onDeselectFunction(target);
        }
    }
}
interface AT {  // address/transaction
    selected: boolean;
    toHTML(): string;
}
class Address implements AT {
    public name: string;
    public string: string;
    public type: string;
    public selected: boolean;

    constructor(name: string, string: string, type: string) {
        this.name = name;
        this.string = string;
        this.type = type;
        this.selected = false;
    }
    static fromElement(element: HTMLElement): Address {
        return new Address(
            element.querySelector('.address__name')?.textContent as string,
            element.querySelector('.address__string')?.textContent as string,
            element.querySelector('.address__type')?.textContent as string
        );
    }
    public toHTML(): string {
        return `<div class="address default-border ${this.selected ? 'at_selected' : 'at_selectable'}">
            <span class="address__name">${this.name}</span>
            <span class="address__string">${this.string}</span>
            <span class="address__type">${this.type}</span>
        </div>`
    }
}
class Addresses {
    static getElements(): Array<HTMLElement> {
        return Array.from(document.querySelectorAll('.address'));
    }
    static getObjects(): Array<Address> {
        return Addresses.getElements().map(Address.fromElement);
    }
    static addAddress(address: Address) {
        document.querySelector('.transactions__bottom')?.insertAdjacentHTML('beforeend', address.toHTML());
    }
    static removeAddress(address: Address) {
        for (let addressElement of Addresses.getElements()) {
            let addressObject = Address.fromElement(addressElement);
            if (addressObject.string == address.string) {
                addressElement.remove();
            }
        }
    }
    static selectAddress(address: Address) {
        for (let addressElement of Addresses.getElements()) {
            let addressObject = Address.fromElement(addressElement);
            if (addressObject.string == address.string) {
                addressElement.classList.add('at_selected');
            }
        }
    }

}
class Transaction implements AT {
    public fromAddress: string;
    public id: string;
    public leftAddress: string;
    public rightAddress: string;
    public otherAddressesCount: Array<number>;
    public amount: number;
    public fullAmount: number;
    public size: number;
    public confirmations: number;
    public weight: number;
    public fee: number;
    public selected: boolean;
    
    constructor(fromAddress: string, id: string, leftAddress: string, rightAddress: string, 
        otherAddressesCount: Array<number>, amount: number, fullAmount: number, size: number, 
        confirmations: number, weight: number, fee: number) {

        this.fromAddress = fromAddress;
        this.id = id;
        this.leftAddress = leftAddress;
        this.rightAddress = rightAddress;
        this.otherAddressesCount = otherAddressesCount;
        this.amount = amount;
        this.fullAmount = fullAmount;
        this.size = size;
        this.confirmations = confirmations;
        this.weight = weight;
        this.fee = fee;
        this.selected = false;
    }
    static fromElement(element: HTMLElement): Transaction {
        var id = element.querySelector('.transaction__id')?.textContent as string;
        var leftAddress = element.querySelector('.transaction__left-address')?.textContent as string;
        var rightAddress = element.querySelector('.transaction__right-address')?.textContent as string;

        var parseNum = (selectorName: string) => {return parseNumber(element.querySelector(`${selectorName}`)?.textContent);}
        var otherAddressesCount = [parseNum('.transaction__left-other'), parseNum('.transaction__right-other')];
        var args = [
            '.transaction__amount',
            '.transaction__full-amount',
            '.transaction__size',
            '.transaction__confirmations',
            '.transaction__weight',
            '.transaction__fee'
        ].map(parseNum);
        return new Transaction('', id, leftAddress, rightAddress, otherAddressesCount, ...args as [number, number, number, number, number, number]);
    }
    public toHTML(): string {  // защитить text entries #todo (mb replace to toElement)
        return `<div class="transaction default-border ${this.selected ? 'at_selected' : 'at_selectable'}">
            <div class="transaction__id-row">
                <span class="transaction__id">${this.id}</span>
            </div>
            <div class="transaction__addresses transaction__row">
                <span class="transaction__left-address transaction__address">${this.leftAddress}</span>
                <img class="transaction__arrow" src="static/img/transaction/arrow_green.svg" alt="-->">
                <span class="transaction__right-address transaction__address">${this.rightAddress}</span>
            </div>
            <div class="transaction__others-n-amount transaction__row">
                <span class="transaction__left-other">Other (${this.otherAddressesCount[0]}+ inps)</span>
                <span class="transaction__amount">+${this.amount}</span>
                <span class="transaction__right-other">Other (${this.otherAddressesCount[1]}+ inps)</span>
            </div>
            <div class="transaction__metadata transaction__row">
                <span class="transaction__full-amount">${this.fullAmount}</span>
                <span class="transaction__size">${this.size}</span>
                <span class="transaction__confirmations">${this.confirmations}+</span>
                <span class="transaction__weight">${this.weight}</span>
                <span class="transaction__fee">${this.fee}</span>
            </div>
        </div>`;
    }
}
class Transactions {
    static getElements(): Array<HTMLElement> {
        var elements: NodeListOf<Element> | null = document.querySelectorAll('.transaction');
        return elements ? Array.from(elements as NodeListOf<HTMLElement>) : [];
    }
    static getObjects(): Array<Transaction> {
        return Transactions.getElements().map(Transaction.fromElement);
    }
    static addTransaction(tx: Transaction): void {
        var transactionsBottom = document.querySelector('.transactions__bottom');
        transactionsBottom?.insertAdjacentHTML('beforeend', tx.toHTML());
        var element = transactionsBottom?.lastChild;

        var onSelect: Function = (transaction: HTMLElement) => {
            Creator.addInput(CreatorInput.fromTransactionElement(transaction));
        }
        var onDeselect: Function = (transaction: HTMLElement) => {
            Creator.removeInputbyID(Transaction.fromElement(transaction).id);
        }

        atSelectHandler(element as HTMLElement, onSelect, onDeselect);
    }
    static removeAllTransactions(): void {
        for (let transaction of Transactions.getElements()) {
            transaction.remove()
        }
    }
    static deselectTransaction(transactionID: string) {
        let transactions = Transactions.getElements();
        for (let tx of transactions) {
            if (Transaction.fromElement(tx).id == transactionID) {
                tx.classList.replace('at_selected', 'at_selectable');
            }
        }
    }
}
class CreatorInput {
    static readonly objectName: string = 'input';
    static readonly objectsName: string = 'inputs';

    public address: string;
    public transactionID: string;
    public transactionAmount: number;
    
    constructor(address: string, transactionID: string, transactionAmount: number) {
        this.address = address;
        this.transactionID = transactionID;
        this.transactionAmount = transactionAmount;
    }
    static fromElement(element: HTMLElement): CreatorInput {
        var transactionID = element.querySelector('.main-creator__input-id')?.textContent;
        var transactionAmount = parseNumber(element.querySelector('.main-creator__input-amount')?.textContent);

        if (NoneObjects.includes(transactionID) || NoneObjects.includes(transactionAmount)) {
            throw new ValueError('input element does not contains required values')
        }

        return new CreatorInput('tempTransactionAddress', transactionID as string, transactionAmount as number);
    }
    static fromTransactionElement(element: HTMLElement): CreatorInput {
        var transactionID = element.querySelector('.transaction__id')?.textContent;
        var transactionAmount = parseNumber(element.querySelector('.transaction__amount')?.textContent);

        if (NoneObjects.includes(transactionID) || NoneObjects.includes(transactionAmount)) {
            throw new ValueError('transaction element does not contains required values for CreatorInput')
        }

        return new CreatorInput('tempTransactionAddress', transactionID as string, transactionAmount as number);
    }
    static isElementCheck(element: any): Boolean {
        return element instanceof HTMLElement && element.classList.contains('main-creator__input')
    }
    public toHTML(): string { // safe insert TODO
        return `<div class="main-creator__input default-border" draggable="true">
            <span class='main-creator__input-id'>${this.transactionID}</span>
            <span class='main-creator__input-amount'>+${this.transactionAmount}</span>
        </div>`;
    }
}
class CreatorOutput {
    static readonly objectName: string = 'output';
    static readonly objectsName: string = 'outputs';

    public address: string;
    public amount: number;

    constructor(address: string, amount: number) {
        this.address = address;
        this.amount = amount;
    }
    static fromElement(element: HTMLElement): CreatorOutput {
        var address = element.querySelector('.main-creator__output-address')?.textContent;
        var amount = parseNumber(element.querySelector('.main-creator__output-amount')?.textContent);

        if (NoneObjects.includes(address) || NoneObjects.includes(amount)) {
            throw new ValueError('output element does not contains required values');
        }

        return new CreatorOutput(address as string, amount as number);
    }
    static validateArguments(address: string, amount: number): boolean {
        // check on valide address with http request to server #todo
        if (address == '' || [NaN, 0].includes(amount)) {
            throw new ValueError('cannot add output with empty values') // #todo show error message
        }
        // if (amount > Creator.totalAvailable) {
        //     throw new ValueError('output amount more then total available') // #todo show error to user
        // }
        return true;
    }
    static isElementCheck(element: any) {
        return element instanceof HTMLElement && element.classList.contains('main-creator__output');
    }
    public toHTML() {
        return `<div class="main-creator__output default-border" draggable="true">
            <span class="main-creator__output-address">${this.address}</span>
            <span class="main-creator__output-amount">-${this.amount}</span>
        </div>`;
    }
}
interface CreatorDraggedElement {
    type: typeof CreatorInput | typeof CreatorOutput;
    element: HTMLElement;
}
class Creator {
    private static getCount(objectType: typeof CreatorInput | typeof CreatorOutput): number {
        return Number(document.querySelector(`.main-creator__${objectType.objectsName}-count`)?.textContent);
    }
    private static setCount(objectType: typeof CreatorInput | typeof CreatorOutput, value: number) {
        var element: HTMLElement | null = document.querySelector(`.main-creator__${objectType.objectsName}-count`);
        if (element instanceof HTMLElement) {
            element.textContent = String(value);
        }
    }
    static getElements(objectType: typeof CreatorInput | typeof CreatorOutput): Array<HTMLElement> {
        var objects = [];
        
        for (let instance of document.querySelectorAll(`.main-creator__${objectType.objectName}`)) {
            objects.push(instance as HTMLElement);
        }

        return objects;
    }
    static getDraggedElement(): CreatorDraggedElement | null {
        var draggedInput = document.querySelector(`.main-creator__${CreatorInput.objectName}.dragging`);
        var draggedOutput = document.querySelector(`.main-creator__${CreatorOutput.objectName}.dragging`);

        var type: typeof CreatorInput | typeof CreatorOutput;
        var element: HTMLElement;
        if (draggedInput instanceof HTMLElement) {
            type = CreatorInput;
            element = draggedInput;
        }
        else if (draggedOutput instanceof HTMLElement) {
            type = CreatorOutput;
            element = draggedOutput;
        }
        else {
            return null;
        }
        return {
            type: type,
            element: element
        } as CreatorDraggedElement
    }
    static updateTotalAvailable() {
        var inputsAmount = Creator.getInputs().reduce((p, n) => {return p.plus(n.transactionAmount);}, new Decimal(0));
        var outputsAmount = Creator.getOutputs().reduce((p, n) => {return p.plus(n.amount);}, new Decimal(0));
        Creator.totalAvailable = inputsAmount.minus(outputsAmount).toNumber();
    }
    static get totalAvailable() {
        return parseNumber(document.querySelector('#main-creator__metadata-total-available-amount')?.textContent)
    }
    static set totalAvailable(value: number) {
        (document.querySelector('#main-creator__metadata-total-available-amount') as HTMLElement).textContent = String(value);
    }

    static get inputsCount(): number {
        return Creator.getCount(CreatorInput);
    }
    static set inputsCount(value: number) {
        Creator.setCount(CreatorInput, value);
    }
    static getInputs(): Array<CreatorInput> {
        return Creator.getElements(CreatorInput).map(CreatorInput.fromElement);
    }
    static addInput(input: CreatorInput) {
        document.querySelector(`.main-creator__inputs`)?.insertAdjacentHTML('beforeend', input.toHTML());
        Creator.inputsCount++;
        Creator.updateTotalAvailable();
    }
    static removeInputbyID(inputTransactionID: string) {
        for (let inpElement of Creator.getElements(CreatorInput)) {
            var inpObject = CreatorInput.fromElement(inpElement) 
            if (inpObject.transactionID == inputTransactionID) {
                inpElement.remove();
                Creator.inputsCount--;
                Creator.updateTotalAvailable();
            }
        }
    }
    static removeAllInputs() {
        for (let inpElement of Creator.getElements(CreatorInput)) {
            inpElement.remove();
        }
        Creator.inputsCount = 0;
        Creator.updateTotalAvailable();
    }

    static get outputsCount(): number {
        return Creator.getCount(CreatorOutput);
    }
    static set outputsCount(value: number) {
        Creator.setCount(CreatorOutput, value);
    }
    static getOutputs(): Array<CreatorOutput> {
        return Creator.getElements(CreatorOutput).map(CreatorOutput.fromElement)
    }
    static addOutput(output: CreatorOutput) {
        document.querySelector(`.main-creator__add-output`)?.insertAdjacentHTML('beforebegin', output.toHTML());
        Creator.outputsCount++;
        Creator.updateTotalAvailable();
    }
    static removeOutputByElement(element: HTMLElement) {
        if (!CreatorOutput.isElementCheck(element)) {
            throw new ValueError('passed element is not CreatorOutput element')
        }
        element.remove();
        Creator.outputsCount--;
        Creator.updateTotalAvailable();
    }
    static removeAllOutputs() {
        for (let element of Creator.getElements(CreatorOutput)) {
            element.remove();
            Creator.outputsCount = 0;
            Creator.updateTotalAvailable();
        }
    }
}

// Dragable input/output:
document.addEventListener('dragstart', (event: DragEvent) => {
    if (CreatorInput.isElementCheck(event.target) || CreatorOutput.isElementCheck(event.target)) {
        (event.target as HTMLElement).classList.add('dragging')
    }
});
document.addEventListener('dragend', (event: DragEvent) => {
    if (CreatorInput.isElementCheck(event.target) || CreatorOutput.isElementCheck(event.target)) {
        (event.target as HTMLElement).classList.remove('dragging')
    }
});
['dragenter', 'dragover'].forEach((listener) => {
    document.addEventListener(listener, (event) => {
        var draggedElement = Creator.getDraggedElement();

        if (!draggedElement || !(event.target instanceof HTMLElement) || event.target.closest('.main-creator')) {
            return
        }
        
        event.preventDefault();
    })
});
document.addEventListener('drop', (event: DragEvent) => {
    var draggedElement = Creator.getDraggedElement();

    if (!draggedElement) {
        return
    }
    if (draggedElement.type === CreatorInput) {
        var transactionID: string = CreatorInput.fromElement(draggedElement.element).transactionID;
        Creator.removeInputbyID(transactionID);
        Transactions.deselectTransaction(transactionID)
    }
    else if (draggedElement.type === CreatorOutput) {
        Creator.removeOutputByElement(draggedElement.element);
    }
});
class ModalWindows {
    static initialize() {
        // close modal on ESC
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                for (let modal of document.querySelectorAll('.modal')) {
                    modal.classList.remove('modal_opened');
                }
            }
        })

        // close modal on click out window
        var modalMouseDownOnClose: boolean = false;
        for (let modal of document.querySelectorAll('.modal')) {
            (modal as HTMLElement).onmousedown = (event: MouseEvent) => {
                if (event.target instanceof HTMLElement && event.target.classList.contains('modal') && event.button == 0) {
                    modalMouseDownOnClose = true;
                }
            }
            (modal as HTMLElement).onmouseup = (event: MouseEvent) => {
                if (modalMouseDownOnClose && event.target instanceof HTMLElement && event.target.classList.contains('modal')) {
                    modal?.classList.remove('modal_opened');
                }
                modalMouseDownOnClose = false;
            }
        }
    }
}
class AddAddressModal {
    static getModalElement(modalName: string): HTMLElement {
        var modalQuery = modalName == 'create' ? '.create-address-modal' : '.import-address-modal'
        return document.querySelector(modalQuery)?.closest('.modal') as HTMLElement;
    }
    static showHideModal(modalName: string, action: string) {
        var modal = AddAddressModal.getModalElement(modalName);
        if (action == 'show') {
            modal?.classList.add('modal_opened')
        }
        else if (action == 'hide') {
            modal?.classList.remove('modal_opened')
        }
    }
    static handle(modalName: string, buttonName: string, action: string) {
        var modal = AddAddressModal.getModalElement(modalName);
        var buttonQuery = buttonName == 'create' ? '.add-address-modal__switcher-create-anim' : '.add-address-modal__switcher-import-anim'
        var button = modal.querySelector(buttonQuery);

        if (action == 'select') {
            button?.classList.add('switcher-anim_selected');
        }
        else if (action == 'unselect') {
            button?.classList.remove('switcher-anim_selected');
        }
    }
    static showCreateModal() {
        AddAddressModal.showHideModal('create', 'show');
    }
    static hideCreateModal() {
        AddAddressModal.showHideModal('create', 'hide');
    }
    static showImportModal() {
        AddAddressModal.showHideModal('import', 'show');
    }
    static hideImportModal() {
        AddAddressModal.showHideModal('import', 'hide');
    }
    static selectCreate() {
        AddAddressModal.showCreateModal();
        AddAddressModal.hideImportModal();

        for (let modalName of ['create', 'import']) {
            AddAddressModal.handle(modalName, 'create', 'select')
            AddAddressModal.handle(modalName, 'import', 'unselect')
        }
    }
    static selectImport() {
        AddAddressModal.showImportModal();
        AddAddressModal.hideCreateModal();

        for (let modalName of ['create', 'import']) {
            AddAddressModal.handle(modalName, 'import', 'select')
            AddAddressModal.handle(modalName, 'create', 'unselect')
        }
    }
}
class AddOutputModalButton {
    static getElement(): HTMLElement {
        return document.querySelector('#add-output-modal__main-button') as HTMLElement;
    }
    static initialize() {
        AddOutputModalButton.getElement().onclick = (event: MouseEvent) => {
            var address: string = (document.querySelector('#add-output-modal__address-input') as HTMLInputElement).value as string;
            var amount: number = Number((document.querySelector('#add-output-modal__amount-input') as HTMLInputElement).value);
    
            if (CreatorOutput.validateArguments(address, amount)) {
                Creator.addOutput(new CreatorOutput(address, amount));
            }
            else {
                // trycatch error and show error message #todo
            }
            // close after add
            document.querySelector('.modal')?.classList.remove('modal_opened'); //
    
            // clear inputs values
            var modalInputs = document.querySelectorAll('.modal input');
            for (let inp of modalInputs) {
                (inp as HTMLInputElement).value = '';
            }
        }
    }
}
class OpenAddOutputModalButton {
    static getElement(): HTMLElement {
        return document.querySelector('#main-creator__add-output-button') as HTMLElement;
    }
    static initialize() {
        OpenAddOutputModalButton.getElement().onclick = (event: MouseEvent) => {
            document.querySelector('.add-output-modal')?.closest('.modal')?.classList.toggle('modal_opened');
        }
    }
}
class OpenAddAddressModalButton {
    static getElement(): HTMLElement {
        return document.querySelector('#add-address-button') as HTMLElement;
    }
    static initialize() {
        OpenAddAddressModalButton.getElement().onclick = (event: MouseEvent) => {
            var createAddressAnim = document.querySelector('.create-address-modal .add-address-modal__switcher-import-anim');
            if (!createAddressAnim?.classList.contains('switcher-anim_selected')) {
                createAddressAnim?.closest('.modal')?.classList.add('modal_opened');
            }
            else {
                document.querySelector('.import-address-modal')?.closest('.modal')?.classList.add('modal_opened');
            }
        }
    }
}
class AddAddressSwitcher {
    static getCreateAddressButtonElement(): HTMLElement {
        return document.querySelector('.import-address-modal .add-address-modal__switcher-create') as HTMLElement;
    }
    static getImportAddressButtonElement(): HTMLElement {
        return document.querySelector('.create-address-modal .add-address-modal__switcher-import') as HTMLElement;
    }
    static initialize() {
        AddAddressSwitcher.getCreateAddressButtonElement().onclick = (event: MouseEvent) => {
            AddAddressModal.selectCreate();
        }
        AddAddressSwitcher.getImportAddressButtonElement().onclick = (event: MouseEvent) => {
            AddAddressModal.selectImport();
        }
    }
}
class SelectAllTransactions {
    static getElement(): HTMLElement {
        return document.querySelector('#select-all-button') as HTMLElement;
    }
    static initialize() {
        SelectAllTransactions.getElement().onclick = (event: Event) => {
            for (let tx of Transactions.getElements()) {
                if (tx.classList.contains('at_selectable')) {
                    tx.click();
                }
            }
        }
    }
}
class RemoveAllCreatorInputsButton {
    static getElement(): HTMLElement {
        return document.querySelector('#main-creator__remove-all-inputs-button') as HTMLElement;
    }
    static initialize() {
        RemoveAllCreatorInputsButton.getElement().onclick = (event: Event) => {
            Creator.removeAllInputs();
            var transactions: Array<HTMLElement> = Transactions.getElements();
            for (let tx of transactions) {
                if (tx.classList.contains('at_selected')) {
                    tx.classList.replace('at_selected', 'at_selectable');
                }
            }
        }
    }
}
class RemoveAllCreatorOutputsButton {
    static getElement(): HTMLElement {
        return document.querySelector('#main-creator__remove-all-outputs-button') as HTMLElement;
    }
    static initialize() {
        RemoveAllCreatorOutputsButton.getElement().onclick = (event: Event) => {
            Creator.removeAllOutputs();
        }
    }
}
function main() {
    console.log('started');

    // temp
    var txs = Transactions.getObjects();
    Transactions.removeAllTransactions();
    txs.forEach((tx) => {Transactions.addTransaction(tx)}) // to make html transactions selectable (add select handler)

    ModalWindows.initialize();
    AddOutputModalButton.initialize();
    OpenAddOutputModalButton.initialize();
    OpenAddAddressModalButton.initialize();
    AddAddressSwitcher.initialize();
    SelectAllTransactions.initialize();
    RemoveAllCreatorInputsButton.initialize();
    RemoveAllCreatorOutputsButton.initialize();

}
// (function () {
//     if (!Element.prototype.closest) {
//         Element.prototype.closest = function (css: any) {
//             var node = this;
//             while (node) {
//                 if (node.matches(css)) return node;
//                 else node = node.parentElement as Element || node.parentNode;
//             }
//             return null;
//         };
//     }
// })();
// (function () {
//     if (!Element.prototype.matches) {
//         Element.prototype.matches = Element.prototype.matchesSelector || 
//             Element.prototype.webkitMatchesSelector || 
//             Element.prototype.mozMatchesSelector ||
//             Element.prototype.msMatchesSelector;
//     }
// })();
document.addEventListener("DOMContentLoaded", (event) => { 
    main();
});