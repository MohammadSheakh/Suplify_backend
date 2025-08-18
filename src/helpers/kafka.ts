import {Kafka, Producer} from 'kafkajs'


const kafka = new Kafka({
    brokers: []
})

// lets create producer and consumers..
/*******************
 * 
    const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

*******************/

let producer : null | Producer = null;

// i don't want to create producer every time .. i want to cache this 
export async function createProducer (){
    if (producer) return producer;
    const _producer = kafka.producer() // make a local producer
    await _producer.connect()
    producer = _producer;
    return producer
}


export async function produceMessage(message : string) {
    const producer = await createProducer()
    // with the help of this producer we can produce message .. 
    await producer.send({
        topic: 'SuplifyMessages', // in which topic we want to publish this message
        messages: [
            { key: `message-${Date.now()}`, value: message }
        ]
    })

    return true ; // which means message is set 
}


/************
async function produceMessage(key:string , message: string){
    const producer = await createProducer()
    // with the help of this producer we can produce message .. 
    ******** GPT Code
    producer.send({
        topic: 'test-topic',
        messages: [
            { key, value: message }
        ]
    })
    *************** *

    // we want to return clouser function
    return () => {

    }
}

********* */


// export default kafka
export { kafka }

/***************

 to install kafka in ubuntu .. 



 * ************** */