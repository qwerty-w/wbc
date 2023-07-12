import React from 'react';
import './Create.css'
import {Addresses} from './add/Addresses'
import {Transactions} from './txs/Transactions'
import {Creater} from './crt/Creater'

function Create() {
  return (
    <div className='main'>
      <Addresses />
      <Transactions />
      <Creater />
    </div>
  );
}

export default Create;
