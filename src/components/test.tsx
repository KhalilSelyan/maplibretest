/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Channel, FoxgloveClient, SubscriptionId } from "@foxglove/ws-protocol";
import {
  parse as parseMessageDefinition,
  parseRos2idl,
  stringify,
} from "@foxglove/rosmsg";
import { useEffect, useState } from "react";
import { ParsedChannel, parseChannel } from "./parseChannel";

const client = new FoxgloveClient({
  ws: new WebSocket("ws://localhost:8765", [
    FoxgloveClient.SUPPORTED_SUBPROTOCOL,
  ]),
});

const Test = () => {
  // use a set to avoid duplicates
  const [topics, setTopics] = useState(new Set());
  const deserializers = new Map<SubscriptionId, (data: DataView) => unknown>();

  client.on("open", () => {
    console.log("connected");
  });
  client.on("error", (error) => {
    console.log("Error", error);
    throw error;
  });
  const [channels, setChannels] = useState<
    {
      channel: Channel[];
      parsedChannel: ParsedChannel;
    }[]
  >([]);
  client.on("advertise", (channel) => {
    // console.log("advertise", channel);
    const textEncoder = new TextEncoder();
    channel.map((c) => {
      let parsedChannel;
      try {
        let schemaEncoding;
        let schemaData;
        if (
          c.encoding === "cdr" &&
          (c.schemaEncoding === undefined ||
            ["ros2idl", "ros2msg"].includes(c.schemaEncoding))
        ) {
          schemaEncoding = c.schemaEncoding ?? "ros2msg";
          schemaData = textEncoder.encode(c.schema);
        } else {
          const msg = c.schemaEncoding
            ? `Unsupported combination of message / schema encoding: (${c.encoding} / ${c.schemaEncoding})`
            : `Unsupported message encoding ${c.encoding}`;
          throw new Error(msg);
        }
        parsedChannel = parseChannel({
          messageEncoding: c.encoding,
          schema: {
            name: c.schemaName,
            encoding: schemaEncoding,
            data: schemaData,
          },
        });

        const resolvedChannel = { channel, parsedChannel };
        setChannels((channels) => [...channels, resolvedChannel]);
      } catch (error) {
        console.log("Error", error);
        throw error;
      }
      setTopics((topics) => new Set([...topics, c.topic]));
      const subId = client.subscribe(c.id);

      if (c.schema.includes("IDL:")) {
        const idl = parseRos2idl(c.schema);
        const messageDefinition = JSON.parse(JSON.stringify(idl, null, 2));
        // console.log("idl \n", messageDefinition);
        //
      } else {
        const messageDefinition = parseMessageDefinition(c.schema, {
          ros2: true,
        });
        // console.log("ros2msg \n", messageDefinition);
      }
      const textDecoder = new TextDecoder();

      deserializers.set(subId, (data) => data);

      // console.log("parsedChannel", parsedChannel);
    });
  });

  client.on("message", ({ subscriptionId, timestamp, data }) => {
    console.log({
      subscriptionId,
      topic:
        channels[subscriptionId] &&
        channels[subscriptionId].channel[subscriptionId].topic &&
        channels[subscriptionId].channel[subscriptionId].topic,

      timestamp,

      // message is a DataView containing the raw message data use the deserializer for this subscription to convert it to a JS object (or whatever you want)

      message:
        // subscriptionId &&
        channels[subscriptionId] &&
        channels[subscriptionId].parsedChannel.deserialize(data),
    });
  });

  // useEffect(() => {
  // log the topics in alphabetical order
  // const topicsArray = Array.from(topics);
  // topicsArray.sort();
  // topicsArray.forEach((topic) => console.log(topic));
  // topicsArray.length > 0 && console.log("topics", topicsArray.length);
  // }, [topics]);

  return <div>Test</div>;
};

export default Test;
