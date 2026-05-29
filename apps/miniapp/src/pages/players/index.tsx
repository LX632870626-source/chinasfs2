import { Input, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicPlayer } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useLoad(() => {
    void loadPlayers();
  });

  async function loadPlayers(keyword = "") {
    try {
      setLoading(true);
      const query = keyword.trim() ? `?search=${encodeURIComponent(keyword.trim())}` : "";
      const data = await publicGet<{ players: PublicPlayer[] }>(`/players${query}`);
      setPlayers(data.players);
    } catch {
      await Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="page">
      <Input
        className="input"
        value={search}
        placeholder="搜索球员姓名"
        confirmType="search"
        onInput={(event) => setSearch(String(event.detail.value))}
        onConfirm={() => void loadPlayers(search)}
      />

      {players.map((player) => (
        <View className="card" key={player.id}>
          <Text className="card-title">{player.name}</Text>
          <View className="muted">
            {player.ageGroup} · {player.position} · {player.region}
          </View>
          <View className="body">{player.traits.join(" / ")}</View>
          <View className="body">{player.bio}</View>
        </View>
      ))}

      {!loading && players.length === 0 ? <View className="empty">没有找到匹配球员</View> : null}
    </View>
  );
}
