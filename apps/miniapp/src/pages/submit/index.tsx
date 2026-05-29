import { Button, Input, Picker, Textarea, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { publicPost } from "../../lib/api";

const submissionTypes = ["PLAYER", "EVENT"] as const;
const submissionLabels = ["球员线索", "赛事线索"] as const;

export default function SubmitPage() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;

    const trimmedContactName = contactName.trim();
    const trimmedContactPhone = contactPhone.trim();
    const trimmedContent = content.trim();

    if (!trimmedContactName) {
      await Taro.showToast({ title: "请填写联系人", icon: "none" });
      return;
    }

    if (trimmedContactPhone.length < 5) {
      await Taro.showToast({ title: "联系方式至少 5 位", icon: "none" });
      return;
    }

    if (trimmedContent.length < 10) {
      await Taro.showToast({ title: "线索内容至少 10 个字", icon: "none" });
      return;
    }

    try {
      setSubmitting(true);
      await publicPost<{ id: string; status: string }>("/submissions", {
        type: submissionTypes[typeIndex],
        contactName: trimmedContactName,
        contactPhone: trimmedContactPhone,
        content: trimmedContent
      });
      await Taro.showToast({ title: "已提交审核", icon: "success" });
      Taro.navigateBack();
    } catch {
      await Taro.showToast({ title: "提交失败，请检查内容", icon: "none" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="page">
      <Picker
        mode="selector"
        range={submissionLabels}
        value={typeIndex}
        onChange={(event) => setTypeIndex(Number(event.detail.value))}
      >
        <View className="picker-field">提交类型：{submissionLabels[typeIndex]}</View>
      </Picker>

      <Input
        className="input"
        placeholder="联系人"
        value={contactName}
        onInput={(event) => setContactName(String(event.detail.value))}
      />
      <Input
        className="input"
        placeholder="联系方式"
        value={contactPhone}
        type="number"
        onInput={(event) => setContactPhone(String(event.detail.value))}
      />
      <Textarea
        className="textarea"
        placeholder="请描述球员或赛事线索，至少 10 个字"
        value={content}
        maxlength={1000}
        onInput={(event) => setContent(String(event.detail.value))}
      />

      <View className="form-actions">
        <Button className="primary-button" loading={submitting} onClick={() => void submit()}>
          提交审核
        </Button>
      </View>
    </View>
  );
}
