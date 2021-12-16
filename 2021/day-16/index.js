const { loadAndTransform, logger, vars } = require('../../helpers');

let codedValues = loadAndTransform(vars.INPUT_FILE, '\n');

function hexToBuffer(hex) {
    return hex.split('').reduce((binary, hex) => {
        let char = parseInt(hex, 16).toString(2).split('').map((int) => parseInt(int, 10));
        while(char.length < 4) {
            char.unshift(0);
        }
        binary = binary.concat(char);
        return binary;
    }, []);
}

function intFromBuf(buf, offset, bits) {
    offset = offset || 0;
    bits = bits || (buf.length - offset);
    return parseInt(buf.slice(offset, offset + bits).join(''), 2);
}

function parseSinglePacket(buf, position) {
    let packet = {
        offset: position,
        size: 0,
        version: intFromBuf(buf, position, 3),
        type: intFromBuf(buf, position + 3, 3)
    }
    position += 6;
    logger.debug(`Packet Version: ${packet.version} - Type: ${packet.type}`);

    switch(packet.type) {
        case 4: {
            // sanity check
            if(position >= buf.length + 6) {
                logger.debug(`   Invalid literal packet`);
                return null;
            }
            let isLast = false;
            let binary = [];
            while(!isLast) {
                isLast = buf[position] == 0;
                binary = binary.concat(buf.slice(position + 1, position + 5));
                position += 5;
            }
            packet.literal = intFromBuf(binary);
            break;
        }
        default: {
            // sanity check
            if(position >= buf.length + 12) {
                logger.debug(`    Invalid operator packet`);
                return null;
            }
            // some operator
            let type = buf[position];
            logger.debug(`    Operator Type: ${type}`)
            position++;
            if(type == 0) {
                let totalLength = intFromBuf(buf, position, 15);
                position += 15;
                logger.debug(`    Operator Length: ${totalLength}`);
                packet.children = parsePackets(buf, position, totalLength);
                let length = packet.children.reduce((sum, child) => sum + child.size, 0);
                if(length != totalLength) {
                    logger.debug(`    !!Parse Length doesnt match total: ${length} - ${totalLength}`);
                }
                position += totalLength; // parse recovery
            } else {
                // number of packets
                let count = intFromBuf(buf, position, 11);
                position += 11;
                logger.debug(`    Operator Count: ${count}`);
                packet.children = [];
                for(let i = 0; i < count; i++) {
                    let child = parseSinglePacket(buf, position);
                    packet.children.push(child);
                    position += child.size;
                }
            }
            break;
        }
    }

    packet.size = position - packet.offset;

    return packet;
}

function parsePackets(buf, position, size) {
    position = position || 0;
    size = (position + size) || buf.length;
    let packets = [];
    while(position < size - 8) {
        let packet = parseSinglePacket(buf, position);
        if(!packet) {
            break;
        }
        packets.push(packet);
        position += packet.size;
    }
    return packets;
}

function sumVersions(packets) {
    return packets.reduce((sum, packet) => {
        sum += packet.version;
        if(packet.children) {
            sum += sumVersions(packet.children);
        }
        return sum;
    }, 0);
}

function evaluatePacket(packet) {
    switch(packet.type) {
        case 0: {
            return packet.children.reduce((sum, child) => {
                return sum + evaluatePacket(child);
            }, 0);
        }
        case 1: {
            return packet.children.reduce((product, child) => {
                return product * evaluatePacket(child);
            }, 1);
        }
        case 2: {
            return packet.children.reduce((min, child) => {
                return Math.min(min, evaluatePacket(child));
            }, Number.MAX_SAFE_INTEGER);
        }
        case 3: {
            return packet.children.reduce((max, child) => {
                return Math.max(max, evaluatePacket(child));
            }, Number.MIN_SAFE_INTEGER);
        }
        case 4: {
            return packet.literal;
        }
        case 5: {
            let [first, second] = packet.children.map(evaluatePacket);
            return first > second ? 1 : 0;
        }
        case 6: {
            let [first, second] = packet.children.map(evaluatePacket);
            return first < second ? 1 : 0;
        }
        case 7: {
            let [first, second] = packet.children.map(evaluatePacket);
            return first == second ? 1 : 0;
        }
    }
}

codedValues.forEach((entry) => {
    logger.info(`Handling: ${entry}`);

    let buf = hexToBuffer(entry);

    logger.debug(`    ${buf.join('')}`);

    let packets = parsePackets(buf);

    let versionSum = sumVersions(packets);
    let result = evaluatePacket(packets[0]);

    logger.info(`    Version Sum - ${versionSum}`);
    logger.info(`    Evaluation  - ${result}`);
});
