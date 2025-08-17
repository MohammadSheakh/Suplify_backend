import {Kafka} from 'kafkajs'


const kafka = new Kafka({
    brokers: []
})

// lets create producer and consumers..
/*******************
 * 
    const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

*******************/

export async function createProducer (){
    const producer = kafka.producer()
    await producer.connect()
    return producer
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