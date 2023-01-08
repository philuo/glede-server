local key = KEYS[1];
local statList = {};

for i,v in ipairs(ARGV) do
    statList[i] = redis.call('HGETALL', key..'?'..v);
end

return statList;
