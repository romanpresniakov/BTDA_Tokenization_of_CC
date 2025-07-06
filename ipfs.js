import pinataSDK from '@pinata/sdk';
import { ethers } from 'ethers';

const pinata = pinataSDK('f394ab8cac5e85c98f62', '1648d443aff28f35ae18114fd7bab9c0c0dd5a2ae29f4d45ba751af8d834c633');

function getMetadata(location, projectName, projedctDescription) {
    // I don't know how does the front end recieve data
    const metadata = {
        projectId: '123',
        projectName: projectName,
        location: location,
        projedctDescription: projedctDescription
      };
    return metadata;
}

async function uploadAndMint(){
    const result = await pinata.pinJSONToIPFS(metadata);
    console.log('Pinned:', result.IpfsHash);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
    'CONTRACT_ADDRESS',
    YourContractABI,
    signer
    );

    const tx = await contract.mintNFT(
    await signer.getAddress(),
    result.IpfsHash,
    metadata.location,
    metadata.projectName,
    metadata.projedctDescription
    );
}
