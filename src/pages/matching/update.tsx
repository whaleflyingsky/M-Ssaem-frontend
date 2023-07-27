/** @jsxImportSource @emotion/react */
import { useRef, useState } from "react";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import Container from "../../components/container/Container";
import { css } from "@emotion/react";
import COLOR from "../../styles/color";
import FONT from "../../styles/font";
import { Editor } from "@toast-ui/react-editor";
import { useUpdateWorry } from "../../hooks/worry/useUpdatedWorry";

const categoryList = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];
const UpdateMatchingPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // TODO: mbti는 로그인한 유저의 mbti로 설정
  const [category, setCategory] = useState("ISFJ");
  const [image, setImage] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState(false);
  const navigate = useNavigate();

  const handleCategoryButtonClick = () => {
    setOpenCategory(!openCategory);
  };
  const handleCategoryClick = (category: string) => {
    setOpenCategory(false);
    setCategory(category);
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const formData = new FormData();

  const data = {
    title: title,
    content: content,
    targetMbti: category,
  };

  formData.append(
    "patchWorryReq",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  formData.append("image", image[0]);

  const editorRef = useRef<any>(null);
  const handleContentChange = () => {
    setContent(editorRef.current.getInstance().getHTML());
  };
  const updateMutation = useUpdateWorry(formData, 1);
  const handleSubmit = () => {
    updateMutation.mutate();
    navigate(-1);
  };

  return (
    <div css={editorContainerCSS}>
      <Container background="#FFFFFF" style={{ padding: "2.5rem" }}>
        <div css={titleBoxCSS}>
          <div css={titleCSS}>M쌤 매칭 고민글</div>
        </div>
        <div>
          <div css={contentCSS}>매칭을 원하는 M쌤 유형을 선택해주세요.</div>
          <div css={inputBoxCSS}>
            <input
              css={[inputCSS, pointerCSS]}
              value={category}
              onClick={handleCategoryButtonClick}
            />
            {openCategory && (
              <div css={categoryBoxCSS}>
                {categoryList.map((category) => (
                  <div
                    css={categoryCSS}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div css={contentCSS}>제목을 입력해주세요.</div>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          css={inputCSS}
        />
        <div css={contentCSS}>내용을 입력해주세요.</div>
        <Editor
          ref={editorRef}
          initialValue="M쌤 매칭 고민글 수정"
          previewStyle="vertical"
          height="30rem"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          onChange={handleContentChange}
        />
        <div css={buttonBoxCSS}>
          <Button
            style={{ marginRight: "0.5rem", background: COLOR.MAIN }}
            onClick={() => navigate(-1)}
          >
            취소하기
          </Button>
          <Button onClick={handleSubmit}>글 쓰기</Button>
        </div>
      </Container>
    </div>
  );
};

export default UpdateMatchingPage;

const editorContainerCSS = css`
  width: calc(100% + 30rem);
  margin-left: -15rem;
  background: ${COLOR.MAIN3};
  padding: 1.5rem 15rem;
`;

const titleBoxCSS = css`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const titleCSS = css`
  font-size: ${FONT.SIZE.TITLE1};
  font-weight: ${FONT.WEIGHT.BOLD};
  color: ${COLOR.MAINDARK};
  margin-bottom: 0.8rem;
`;

const categoryBoxCSS = css`
  display: flex;
  flex-wrap: wrap;
  width: 40%;

  border: 1px solid ${COLOR.GRAY4};
  border-radius: 1rem;
  padding: 1rem 1rem 1rem 2rem;
  margin-bottom: 1rem;

  position: absolute;
  left: 0;
  top: 2.8rem;
  background: ${COLOR.WHITE};
  z-index: 1;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const categoryCSS = css`
  flex-basis: 20%;
  font-size: ${FONT.SIZE.HEADLINE};
  font-weight: ${FONT.WEIGHT.REGULAR};
  color: ${COLOR.GRAY2};
  cursor: pointer;
  padding: 0.5rem 0;
`;

const contentCSS = css`
  font-size: ${FONT.SIZE.HEADLINE};
  font-weight: ${FONT.WEIGHT.REGULAR};
  color: ${COLOR.GRAY2};
  margin: 0.5rem 0;
`;

const inputBoxCSS = css`
  position: relative;
`;

const inputCSS = css`
  width: 100%;
  height: 2.5rem;
  border: 1.5px solid ${COLOR.GRAY4};
  border-radius: 0.5rem;
  padding: 0.5rem 0.7rem;
  margin-bottom: 1rem;
`;

const buttonBoxCSS = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const pointerCSS = css`
  cursor: pointer;
`;
