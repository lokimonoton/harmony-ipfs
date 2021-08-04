import Head from 'next/head'
import { Container } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import Web3 from "web3";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td 
} from "@chakra-ui/react";
import {useRef,useState, useEffect} from "react"
import { create } from 'ipfs-http-client'
import IPFScontract from "../abi/IPFSstorage.json"
export default function Home() {
  const [inputFile,setInputFile]=useState(null)
  const [ethereumEnabled,setEthereumEnabled]=useState(false)
  const [web3,setWeb3]=useState(null)
  const [transaction,setTransaction]=useState(null)
  const [ipfsHash,setIpfsHash]=useState(null)
  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      setWeb3(new Web3(window.ethereum))
      setEthereumEnabled(true)
      return true;
    }
    setEthereumEnabled(false)
    return false;
  }
  const fileInput = useRef(null); // trigger choose file button for later
  const client = create('http://localhost:5001/api/v0') // function to upload to ipfs
  async function onChange(e){ // function to detect file change
    const file = e.target.files[0]
    setInputFile(file)  
  }
  async function uploadFileToIPFS(file){
    try {
      const added = await client.add(file)
      let contract = new web3.eth.Contract(IPFScontract.abi, "<contract address>")
      const from=(await web3.eth.getAccounts())[0]
      const contractTransaction=await contract.methods.sendHash(added.path).send({ from })
      setTransaction(contractTransaction)
      console.log(contractTransaction)
   setInputFile(null)
      
    } catch (error) {
      console.log('Error uploading file: ', error)
      return false
      
    }  
  }
  async function getIPFSHash(){
    try {
      
      let contract = new web3.eth.Contract(IPFScontract.abi, "<contract address>")
      const contractIpfsHash=await contract.methods.getHash().call()
      setIpfsHash(contractIpfsHash)
   
    } catch (error) {
      console.log('Error getting hash: ', error)
      return false
      
    }  
  }
  return (
    <Container>
      <Head>
        <title>IPFS + Harmony</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <input
      ref={fileInput}
        type="file"
        style={{visibility:"hidden"}}
        onChange={onChange}
      />
      <Center mt="10px"><b>Upload file to ipfs and harmony blockchain</b></Center>
      <Center h="100px" color="white">
      {!ethereumEnabled?<Button colorScheme="blue" onClick={()=>ethEnabled()}>Login with metamask</Button>:<Button colorScheme="orange">Logout</Button>}
        
        
      </Center>
      <Center style={{display:!ethereumEnabled?"none":"flex"}} h="100px" color="white">
      
        <Button colorScheme="blue" onClick={()=>fileInput.current.click()}>{inputFile?inputFile.name:"Choose File"}</Button>
       
        
      </Center>
      <Center style={{display:!ethereumEnabled||!inputFile?"none":"flex"}} h="100px" color="white">
        <Button colorScheme="green" onClick={()=>uploadFileToIPFS(inputFile)}>Upload File</Button>
      </Center>
      <Center style={{display:!ethereumEnabled||!transaction?"none":"flex"}}><b>Transaction Detail</b></Center>
      <Table style={{display:!ethereumEnabled||!transaction?"none":""}} variant="simple">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Transaction Hash</Td>
            <Td>{transaction?.transactionHash}</Td>
           
          </Tr>
          <Tr>
            <Td>Status</Td>
            <Td>{transaction?.status}</Td>
           
          </Tr>
          <Tr>
            <Td>Gas Used</Td>
            <Td>{transaction?.gasUsed}</Td>
         
          </Tr>
          <Tr>
            <Td>Block Number</Td>
            <Td>{transaction?.blockNumber}</Td>
         
          </Tr>
          <Tr>
            <Td>Block Hash</Td>
            <Td>{transaction?.blockHash}</Td>
         
          </Tr>
        </Tbody>
       
      </Table>
      <Center style={{display:!ethereumEnabled||!transaction?"none":"flex"}} h="100px" color="white">
      
        <Button colorScheme="blue" onClick={()=>getIPFSHash()}>Get IPFS URL</Button>
        
       
        
      </Center>
      <Center><a target="_blank" href={ipfsHash?`http://localhost:8080/ipfs/${ipfsHash}`:"#"}>{ipfsHash?`http://localhost:8080/ipfs/${ipfsHash}`:""}</a></Center>
    </Container>
  )
}
