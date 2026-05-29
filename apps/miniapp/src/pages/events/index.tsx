import { Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import type { PublicEvent } from "@future-stars/shared";
import { publicGet } from "../../lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useLoad(() => {
    void loadEvents();
  });

  async function loadEvents() {
    try {
      const data = await publicGet<{ events: PublicEvent[] }>("/events");
      setEvents(data.events);
    } catch {
      await Taro.showToast({ title: "加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="page">
      {events.map((event) => (
        <View className="card" key={event.id}>
          <Text className="card-title">{event.name}</Text>
          <View className="muted">
            {event.ageGroup} · {event.region} · {event.location}
          </View>
          <View className="body">{new Date(event.startsAt).toLocaleString()}</View>
          <View className="body">{event.summary}</View>
        </View>
      ))}

      {!loading && events.length === 0 ? <View className="empty">暂无赛事</View> : null}
    </View>
  );
}
