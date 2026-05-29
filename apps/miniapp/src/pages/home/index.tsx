import { Button, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicEvent, PublicPlayer } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

type HomeResponse = {
  featuredPlayers: PublicPlayer[];
  upcomingEvents: PublicEvent[];
};

export default function HomePage() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useLoad(() => {
    void loadHome();
  });

  async function loadHome() {
    try {
      const data = await publicGet<HomeResponse>("/home");
      setPlayers(data.featuredPlayers);
      setEvents(data.upcomingEvents);
    } catch {
      await Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="page">
      <View className="hero">
        <Text className="hero-title">中国足球未来之星</Text>
        <Text className="hero-copy">发现小球员，追踪青少年赛程。</Text>
      </View>

      <View className="section">
        <Button className="primary-button" onClick={() => Taro.navigateTo({ url: "/pages/submit/index" })}>
          提交球员或赛事线索
        </Button>
      </View>

      <View className="section">
        <View className="section-header">
          <Text className="section-title">本周未来之星</Text>
          <Button className="link-button" onClick={() => Taro.switchTab({ url: "/pages/players/index" })}>
            查看更多
          </Button>
        </View>
        {players.map((player) => (
          <View className="card" key={player.id}>
            <Text className="card-title">{player.name}</Text>
            <View className="muted">
              {player.ageGroup} · {player.position} · {player.teamName}
            </View>
            <View className="body">{player.bio}</View>
          </View>
        ))}
        {!loading && players.length === 0 ? <View className="empty">暂无推荐球员</View> : null}
      </View>

      <View className="section">
        <View className="section-header">
          <Text className="section-title">即将开赛</Text>
          <Button className="link-button" onClick={() => Taro.switchTab({ url: "/pages/events/index" })}>
            查看更多
          </Button>
        </View>
        {events.map((event) => (
          <View className="card" key={event.id}>
            <Text className="card-title">{event.name}</Text>
            <View className="muted">
              {event.ageGroup} · {event.region} · {event.location}
            </View>
            <View className="body">{new Date(event.startsAt).toLocaleString()}</View>
          </View>
        ))}
        {!loading && events.length === 0 ? <View className="empty">暂无即将开赛</View> : null}
      </View>
    </View>
  );
}
