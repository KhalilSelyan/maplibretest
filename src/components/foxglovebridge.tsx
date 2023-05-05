/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  type Channel,
  FoxgloveClient,
  type SubscriptionId,
} from "@foxglove/ws-protocol";
import {
  parse as parseMessageDefinition,
  parseRos2idl,
} from "@foxglove/rosmsg";
import { useEffect, useState } from "react";
import { type ParsedChannel, parseChannel } from "./parseChannel";

const client = new FoxgloveClient({
  ws: new WebSocket("ws://localhost:8765", [
    FoxgloveClient.SUPPORTED_SUBPROTOCOL,
  ]),
});

const Test = () => {
  // use a set to avoid duplicates
  const [topics, setTopics] = useState<string[]>([]);
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

      if (!topics.includes(c.topic)) {
        setTopics((topics) => [...topics, c.topic]);
      }

      const subId = client.subscribe(c.id);

      if (c.schema.includes("IDL:")) {
        const idl = parseRos2idl(c.schema);
        const messageDefinition = JSON.parse(JSON.stringify(idl, null, 2));
        // console.log("idl \n", messageDefinition);
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

  client.on("message", ({ subscriptionId, data, timestamp }) => {
    console.log("message", {
      subscriptionId,
      data,
      timestamp,
    });

    console.log(topics[subscriptionId]);
  });

  return <div>Test</div>;
};

export default Test;
