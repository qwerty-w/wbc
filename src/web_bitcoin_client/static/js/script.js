"use strict";
const NoneObjects = [null, undefined, '', NaN];
class ValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValueError';
    }
}
function parseNumber(object) {
    var num = Number(object);
    if (num == NaN || typeof object == 'string' || object instanceof String) {
        return Number(object.replace(/[^0-9/.]/g, ''));
    }
    return num;
}
function atSelectHandler(element, onSelectFunction, onDeselectFunction) {
    element.onclick = (event) => {
        var target = event.currentTarget;
        var states = ['at_selectable', 'at_selected'];
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if (target.classList.contains(states[0])) { // selectable -> selected
            target.classList.replace(...states);
            onSelectFunction(target);
        }
        else if (target.classList.contains(states[1])) { // selected -> selectable
            target.classList.replace(...states.reverse());
            onDeselectFunction(target);
        }
    };
}
class Address {
    name;
    string;
    type;
    selected;
    constructor(name, string, type) {
        this.name = name;
        this.string = string;
        this.type = type;
        this.selected = false;
    }
    static fromElement(element) {
        return new Address(element.querySelector('.address__name')?.textContent, element.querySelector('.address__string')?.textContent, element.querySelector('.address__type')?.textContent);
    }
    toHTML() {
        return `<div class="address default-border ${this.selected ? 'at_selected' : 'at_selectable'}">
            <span class="address__name">${this.name}</span>
            <span class="address__string">${this.string}</span>
            <span class="address__type">${this.type}</span>
        </div>`;
    }
}
class Addresses {
    static getElements() {
        return Array.from(document.querySelectorAll('.address'));
    }
    static getObjects() {
        return Addresses.getElements().map(Address.fromElement);
    }
    static addAddress(address) {
        document.querySelector('.transactions__bottom')?.insertAdjacentHTML('beforeend', address.toHTML());
    }
    static removeAddress(address) {
        for (let addressElement of Addresses.getElements()) {
            let addressObject = Address.fromElement(addressElement);
            if (addressObject.string == address.string) {
                addressElement.remove();
            }
        }
    }
    static selectAddress(address) {
        for (let addressElement of Addresses.getElements()) {
            let addressObject = Address.fromElement(addressElement);
            if (addressObject.string == address.string) {
                addressElement.classList.add('at_selected');
            }
        }
    }
}
class Transaction {
    fromAddress;
    id;
    leftAddress;
    rightAddress;
    otherAddressesCount;
    amount;
    fullAmount;
    size;
    confirmations;
    weight;
    fee;
    selected;
    constructor(fromAddress, id, leftAddress, rightAddress, otherAddressesCount, amount, fullAmount, size, confirmations, weight, fee) {
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
    static fromElement(element) {
        var id = element.querySelector('.transaction__id')?.textContent;
        var leftAddress = element.querySelector('.transaction__left-address')?.textContent;
        var rightAddress = element.querySelector('.transaction__right-address')?.textContent;
        var parseNum = (selectorName) => { return parseNumber(element.querySelector(`${selectorName}`)?.textContent); };
        var otherAddressesCount = [parseNum('.transaction__left-other'), parseNum('.transaction__right-other')];
        var args = [
            '.transaction__amount',
            '.transaction__full-amount',
            '.transaction__size',
            '.transaction__confirmations',
            '.transaction__weight',
            '.transaction__fee'
        ].map(parseNum);
        return new Transaction('', id, leftAddress, rightAddress, otherAddressesCount, ...args);
    }
    toHTML() {
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
    static getElements() {
        var elements = document.querySelectorAll('.transaction');
        return elements ? Array.from(elements) : [];
    }
    static getObjects() {
        return Transactions.getElements().map(Transaction.fromElement);
    }
    static addTransaction(tx) {
        var transactionsBottom = document.querySelector('.transactions__bottom');
        transactionsBottom?.insertAdjacentHTML('beforeend', tx.toHTML());
        var element = transactionsBottom?.lastChild;
        var onSelect = (transaction) => {
            Creator.addInput(CreatorInput.fromTransactionElement(transaction));
        };
        var onDeselect = (transaction) => {
            Creator.removeInputbyID(Transaction.fromElement(transaction).id);
        };
        atSelectHandler(element, onSelect, onDeselect);
    }
    static removeAllTransactions() {
        for (let transaction of Transactions.getElements()) {
            transaction.remove();
        }
    }
    static deselectTransaction(transactionID) {
        let transactions = Transactions.getElements();
        for (let tx of transactions) {
            if (Transaction.fromElement(tx).id == transactionID) {
                tx.classList.replace('at_selected', 'at_selectable');
            }
        }
    }
}
class CreatorInput {
    static objectName = 'input';
    static objectsName = 'inputs';
    address;
    transactionID;
    transactionAmount;
    constructor(address, transactionID, transactionAmount) {
        this.address = address;
        this.transactionID = transactionID;
        this.transactionAmount = transactionAmount;
    }
    static fromElement(element) {
        var transactionID = element.querySelector('.main-creator__input-id')?.textContent;
        var transactionAmount = parseNumber(element.querySelector('.main-creator__input-amount')?.textContent);
        if (NoneObjects.includes(transactionID) || NoneObjects.includes(transactionAmount)) {
            throw new ValueError('input element does not contains required values');
        }
        return new CreatorInput('tempTransactionAddress', transactionID, transactionAmount);
    }
    static fromTransactionElement(element) {
        var transactionID = element.querySelector('.transaction__id')?.textContent;
        var transactionAmount = parseNumber(element.querySelector('.transaction__amount')?.textContent);
        if (NoneObjects.includes(transactionID) || NoneObjects.includes(transactionAmount)) {
            throw new ValueError('transaction element does not contains required values for CreatorInput');
        }
        return new CreatorInput('tempTransactionAddress', transactionID, transactionAmount);
    }
    static isElementCheck(element) {
        return element instanceof HTMLElement && element.classList.contains('main-creator__input');
    }
    toHTML() {
        return `<div class="main-creator__input default-border" draggable="true">
            <span class='main-creator__input-id'>${this.transactionID}</span>
            <span class='main-creator__input-amount'>+${this.transactionAmount}</span>
        </div>`;
    }
}
class CreatorOutput {
    static objectName = 'output';
    static objectsName = 'outputs';
    address;
    amount;
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
    static fromElement(element) {
        var address = element.querySelector('.main-creator__output-address')?.textContent;
        var amount = parseNumber(element.querySelector('.main-creator__output-amount')?.textContent);
        if (NoneObjects.includes(address) || NoneObjects.includes(amount)) {
            throw new ValueError('output element does not contains required values');
        }
        return new CreatorOutput(address, amount);
    }
    static validateArguments(address, amount) {
        // check on valide address with http request to server #todo
        if (address == '' || [NaN, 0].includes(amount)) {
            throw new ValueError('cannot add output with empty values'); // #todo show error message
        }
        // if (amount > Creator.totalAvailable) {
        //     throw new ValueError('output amount more then total available') // #todo show error to user
        // }
        return true;
    }
    static isElementCheck(element) {
        return element instanceof HTMLElement && element.classList.contains('main-creator__output');
    }
    toHTML() {
        return `<div class="main-creator__output default-border" draggable="true">
            <span class="main-creator__output-address">${this.address}</span>
            <span class="main-creator__output-amount">-${this.amount}</span>
        </div>`;
    }
}
class Creator {
    static getCount(objectType) {
        return Number(document.querySelector(`.main-creator__${objectType.objectsName}-count`)?.textContent);
    }
    static setCount(objectType, value) {
        var element = document.querySelector(`.main-creator__${objectType.objectsName}-count`);
        if (element instanceof HTMLElement) {
            element.textContent = String(value);
        }
    }
    static getElements(objectType) {
        var objects = [];
        for (let instance of document.querySelectorAll(`.main-creator__${objectType.objectName}`)) {
            objects.push(instance);
        }
        return objects;
    }
    static getDraggedElement() {
        var draggedInput = document.querySelector(`.main-creator__${CreatorInput.objectName}.dragging`);
        var draggedOutput = document.querySelector(`.main-creator__${CreatorOutput.objectName}.dragging`);
        var type;
        var element;
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
        };
    }
    static updateTotalAvailable() {
        var inputsAmount = Creator.getInputs().reduce((p, n) => { return p.plus(n.transactionAmount); }, new Decimal(0));
        var outputsAmount = Creator.getOutputs().reduce((p, n) => { return p.plus(n.amount); }, new Decimal(0));
        Creator.totalAvailable = inputsAmount.minus(outputsAmount).toNumber();
    }
    static get totalAvailable() {
        return parseNumber(document.querySelector('#main-creator__metadata-total-available-amount')?.textContent);
    }
    static set totalAvailable(value) {
        document.querySelector('#main-creator__metadata-total-available-amount').textContent = String(value);
    }
    static get inputsCount() {
        return Creator.getCount(CreatorInput);
    }
    static set inputsCount(value) {
        Creator.setCount(CreatorInput, value);
    }
    static getInputs() {
        return Creator.getElements(CreatorInput).map(CreatorInput.fromElement);
    }
    static addInput(input) {
        document.querySelector(`.main-creator__inputs`)?.insertAdjacentHTML('beforeend', input.toHTML());
        Creator.inputsCount++;
        Creator.updateTotalAvailable();
    }
    static removeInputbyID(inputTransactionID) {
        for (let inpElement of Creator.getElements(CreatorInput)) {
            var inpObject = CreatorInput.fromElement(inpElement);
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
    static get outputsCount() {
        return Creator.getCount(CreatorOutput);
    }
    static set outputsCount(value) {
        Creator.setCount(CreatorOutput, value);
    }
    static getOutputs() {
        return Creator.getElements(CreatorOutput).map(CreatorOutput.fromElement);
    }
    static addOutput(output) {
        document.querySelector(`.main-creator__add-output`)?.insertAdjacentHTML('beforebegin', output.toHTML());
        Creator.outputsCount++;
        Creator.updateTotalAvailable();
    }
    static removeOutputByElement(element) {
        if (!CreatorOutput.isElementCheck(element)) {
            throw new ValueError('passed element is not CreatorOutput element');
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
document.addEventListener('dragstart', (event) => {
    if (CreatorInput.isElementCheck(event.target) || CreatorOutput.isElementCheck(event.target)) {
        event.target.classList.add('dragging');
    }
});
document.addEventListener('dragend', (event) => {
    if (CreatorInput.isElementCheck(event.target) || CreatorOutput.isElementCheck(event.target)) {
        event.target.classList.remove('dragging');
    }
});
['dragenter', 'dragover'].forEach((listener) => {
    document.addEventListener(listener, (event) => {
        var draggedElement = Creator.getDraggedElement();
        if (!draggedElement || !(event.target instanceof HTMLElement) || event.target.closest('.main-creator')) {
            return;
        }
        event.preventDefault();
    });
});
document.addEventListener('drop', (event) => {
    var draggedElement = Creator.getDraggedElement();
    if (!draggedElement) {
        return;
    }
    if (draggedElement.type === CreatorInput) {
        var transactionID = CreatorInput.fromElement(draggedElement.element).transactionID;
        Creator.removeInputbyID(transactionID);
        Transactions.deselectTransaction(transactionID);
    }
    else if (draggedElement.type === CreatorOutput) {
        Creator.removeOutputByElement(draggedElement.element);
    }
});
class ModalWindows {
    static initialize() {
        // close modal on ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                for (let modal of document.querySelectorAll('.modal')) {
                    modal.classList.remove('modal_opened');
                }
            }
        });
        // close modal on click out window
        var modalMouseDownOnClose = false;
        for (let modal of document.querySelectorAll('.modal')) {
            modal.onmousedown = (event) => {
                if (event.target instanceof HTMLElement && event.target.classList.contains('modal') && event.button == 0) {
                    modalMouseDownOnClose = true;
                }
            };
            modal.onmouseup = (event) => {
                if (modalMouseDownOnClose && event.target instanceof HTMLElement && event.target.classList.contains('modal')) {
                    modal?.classList.remove('modal_opened');
                }
                modalMouseDownOnClose = false;
            };
        }
    }
}
class AddAddressModal {
    static getModalElement(modalName) {
        var modalQuery = modalName == 'create' ? '.create-address-modal' : '.import-address-modal';
        return document.querySelector(modalQuery)?.closest('.modal');
    }
    static showHideModal(modalName, action) {
        var modal = AddAddressModal.getModalElement(modalName);
        if (action == 'show') {
            modal?.classList.add('modal_opened');
        }
        else if (action == 'hide') {
            modal?.classList.remove('modal_opened');
        }
    }
    static handle(modalName, buttonName, action) {
        var modal = AddAddressModal.getModalElement(modalName);
        var buttonQuery = buttonName == 'create' ? '.add-address-modal__switcher-create-anim' : '.add-address-modal__switcher-import-anim';
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
            AddAddressModal.handle(modalName, 'create', 'select');
            AddAddressModal.handle(modalName, 'import', 'unselect');
        }
    }
    static selectImport() {
        AddAddressModal.showImportModal();
        AddAddressModal.hideCreateModal();
        for (let modalName of ['create', 'import']) {
            AddAddressModal.handle(modalName, 'import', 'select');
            AddAddressModal.handle(modalName, 'create', 'unselect');
        }
    }
}
class AddOutputModalButton {
    static getElement() {
        return document.querySelector('#add-output-modal__main-button');
    }
    static initialize() {
        AddOutputModalButton.getElement().onclick = (event) => {
            var address = document.querySelector('#add-output-modal__address-input').value;
            var amount = Number(document.querySelector('#add-output-modal__amount-input').value);
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
                inp.value = '';
            }
        };
    }
}
class OpenAddOutputModalButton {
    static getElement() {
        return document.querySelector('#main-creator__add-output-button');
    }
    static initialize() {
        OpenAddOutputModalButton.getElement().onclick = (event) => {
            document.querySelector('.add-output-modal')?.closest('.modal')?.classList.toggle('modal_opened');
        };
    }
}
class OpenAddAddressModalButton {
    static getElement() {
        return document.querySelector('#add-address-button');
    }
    static initialize() {
        OpenAddAddressModalButton.getElement().onclick = (event) => {
            var createAddressAnim = document.querySelector('.create-address-modal .add-address-modal__switcher-import-anim');
            if (!createAddressAnim?.classList.contains('switcher-anim_selected')) {
                createAddressAnim?.closest('.modal')?.classList.add('modal_opened');
            }
            else {
                document.querySelector('.import-address-modal')?.closest('.modal')?.classList.add('modal_opened');
            }
        };
    }
}
class AddAddressSwitcher {
    static getCreateAddressButtonElement() {
        return document.querySelector('.import-address-modal .add-address-modal__switcher-create');
    }
    static getImportAddressButtonElement() {
        return document.querySelector('.create-address-modal .add-address-modal__switcher-import');
    }
    static initialize() {
        AddAddressSwitcher.getCreateAddressButtonElement().onclick = (event) => {
            AddAddressModal.selectCreate();
        };
        AddAddressSwitcher.getImportAddressButtonElement().onclick = (event) => {
            AddAddressModal.selectImport();
        };
    }
}
class SelectAllTransactions {
    static getElement() {
        return document.querySelector('#select-all-button');
    }
    static initialize() {
        SelectAllTransactions.getElement().onclick = (event) => {
            for (let tx of Transactions.getElements()) {
                if (tx.classList.contains('at_selectable')) {
                    tx.click();
                }
            }
        };
    }
}
class RemoveAllCreatorInputsButton {
    static getElement() {
        return document.querySelector('#main-creator__remove-all-inputs-button');
    }
    static initialize() {
        RemoveAllCreatorInputsButton.getElement().onclick = (event) => {
            Creator.removeAllInputs();
            var transactions = Transactions.getElements();
            for (let tx of transactions) {
                if (tx.classList.contains('at_selected')) {
                    tx.classList.replace('at_selected', 'at_selectable');
                }
            }
        };
    }
}
class RemoveAllCreatorOutputsButton {
    static getElement() {
        return document.querySelector('#main-creator__remove-all-outputs-button');
    }
    static initialize() {
        RemoveAllCreatorOutputsButton.getElement().onclick = (event) => {
            Creator.removeAllOutputs();
        };
    }
}
function main() {
    console.log('started');
    // temp
    var txs = Transactions.getObjects();
    Transactions.removeAllTransactions();
    txs.forEach((tx) => { Transactions.addTransaction(tx); }); // to make html transactions selectable (add select handler)
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
