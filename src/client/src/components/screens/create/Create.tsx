import React from 'react';
import './Create.css'
import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

function Create() {
  return (
    <div className='main'>
      <Addresses />
      <Transactions />
      <Creator />
    </div>
  );
}

export default Create;
