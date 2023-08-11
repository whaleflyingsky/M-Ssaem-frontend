/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import COLOR from "../../styles/color";
import Container from "../../components/container/Container";
import { useState,useEffect } from "react";
import FONT from "../../styles/font";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router";
import { CreateDebateOption, Option } from "../../interfaces/debate";
import PlusButton from "../../components/button/plusbutton/PlusButton";
import { mssaemAxios as axios } from "../../apis/axios";
import { useCreateDebate } from "../../hooks/debate/useCreateDebate";
import { useUpdateDebate } from "../../hooks/debate/useUpdateDebate";
import { useParams } from "react-router-dom";
import { useDebateDetail } from "../../hooks/debate/useDetailDebate";

interface imgFileProp {
  fileProp: File|null;
}
//서버연결 x
const UpdateDebatePage = () => {  
  const navigate = useNavigate();
  const { id } = useParams();
  const { debate } = useDebateDetail(parseInt(id!!));

  const [title, setTitle] = useState(debate!!.discussionSimpleInfo.title);
  const [content, setContent] = useState(debate!!.discussionSimpleInfo.content);
  const [options, setOptions] = useState<CreateDebateOption[]>([]);
  const [getoptions, setGetOptions] = useState<Option[]>(debate!!.discussionSimpleInfo.options);
  const [image, setImage] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<imgFileProp[]>([]);

  useEffect(() => {
    const initialOptions = getoptions.map((getoption) => {
      const { content, imgUrl } = getoption;
        if (imgUrl !==null) {
          return {
           content: content,
           image: imgUrl,
           hasImage: true,
          }}
          else{
            return {
              content: content,
              image: null,
              hasImage: false,
             }
          }
    });
    setOptions(initialOptions);
  }, [getoptions]);

  const fetchImages = async () => {
    const imageFiles: any = getoptions.map(async (getoption) => {
        const { imgUrl } = getoption;
        if (imgUrl !==null ) {
          try {
            const response = await axios.get(imgUrl, {
              responseType: "blob",
            });
            const blob = response.data;
            const file = new File([blob], "image.png"); // 파일 이름을 적절하게 수정
            return file;
          } catch (error) {
            console.error("Error fetching image:", error);
            return null;
          }
        } else {
          return null;
        }
      })
      if (imageFiles !== null){
    setImageFile(imageFiles);
      }
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleOptionTextChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, content: value } : option
    );
    setOptions(updatedOptions);
  };
  const handleImageBlobHook = async (blob: Blob) => {
    const imgUrl = await uploadImage(blob);
    setImage([...image, imgUrl]);
    return imgUrl;
  };
  const handleImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imgUUrl = await handleImageBlobHook(file); // 기다려서 이미지 URL을 얻음
        const updatedOptions = options.map((option, i) =>
          i === index ? { ...option, image: imgUUrl, hasImage: true } : option
        );
        setOptions(updatedOptions);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };
  
  const formData = new FormData();
  const data = {
    title: title,
    content: content,
    getOptionReqs: options.map(({ image, ...rest }) => rest),
  };

formData.append(
  "DiscussionReq",
  new Blob([JSON.stringify(data)], { type: "application/json" }),
);
formData.append(
  "image",
  new Blob([JSON.stringify(image)], { type: "application/json" }),
);

const uploadImage = async (blob: Blob) => {
  const formData = new FormData();
  formData.append("image", blob);
  const imgUrl = await axios.post("/member/discussion-options/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return imgUrl.data;
};
  const updateMutation = useUpdateDebate(formData, debate!!.discussionSimpleInfo.id);
  const handleSubmit = () => {
    updateMutation.mutate();
    navigate(-1);
  };

  const handleAddOption = () => {
    if (options.length < 4) {
      // 최대 4개까지 선택지를 추가할 수 있도록 제한
      setOptions([
        ...options,
        {
          content: "",
          hasImage: false,
          image: null,
        },
      ]);
    }
  };

  // 선택지를 삭제하는 함수
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length > 2) {
      image.splice(indexToRemove, 1);
      const updatedOptions = options.map((option, index) =>
        index === indexToRemove ? { ...option, hasImage: false } : option
      );
      setOptions(updatedOptions);
      setOptions(options.filter((option, index) => index !== indexToRemove));
    }
  };



  return (
    <div css={editorContainerCSS}>
      <Container addCSS={containerCSS}>
        <div css={titleCSS}>과몰입 토론</div>
        <div css={contentCSS}>제목을 입력해주세요.</div>
        <input 
          type="text" 
          value={title} 
          onChange={handleTitleChange} 
          css={inputCSS}/>
        <div css={imagecontentCSS}>선택지를 선택해주세요. (2~4개)</div>
        <div css={selectuplodGrid}>
          {options.map((option, index) => (
          <div css={selectuplodGridinContents} key={index}>
            <div css={selectuplodGridinContentsBox}>
              <div css={controlSize}>
                <div css={controlSizetop}>
                {options.length > 2 && (
                  <Button onClick={() => handleRemoveOption(index)}>X</Button>
                )}
                </div>

                <label css={uploadLabelCSS}>
                {option.image !==null
                  && (<img src={option.image} alt="Selected" css={imageCSS} />)}
                {option.image === null 
                  && <PlusButton>+</PlusButton>}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(index, e)}
                  css={uploadInputCSS} />
                </label>
                  <input
                    type="text"
                    value={option.content}
                    onChange={(e) => handleOptionTextChange(index, e)}
                    css={optionInputCSS}
                  />
                </div>
              </div>
            </div>
            ))}
            {options.length < 4 && (
              <Button onClick={handleAddOption}>+</Button>
             )}
        </div>

        <div css={contentCSS}>내용을 입력해주세요. (선택)</div>
        <textarea 
          value={content} 
          onChange={handleContentChange} 
          css={textareaCSS} />

        <div css={buttonBoxCSS}>
          <Button addCSS={buttonCSS} onClick={() => navigate(-1)}>
            취소하기
          </Button>

          <Button 
          onClick={handleSubmit}
          >글 쓰기</Button>
        </div>
      </Container>
    </div>
  );
};

export default UpdateDebatePage;

const containerCSS = css`
  background: ${COLOR.WHITE};
  padding: 2.5rem;
`;

const editorContainerCSS = css`
  width: calc(100% + 30rem);
  margin-left: -15rem;
  background: ${COLOR.MAIN3};
  padding: 1.5rem 15rem;
`;

const titleCSS = css`
  font-size: ${FONT.SIZE.TITLE1};
  font-weight: ${FONT.WEIGHT.BOLD};
  color: ${COLOR.MAINDARK};
  margin-bottom: 1rem;
`;

const imagecontentCSS = css`
  font-size: ${FONT.SIZE.HEADLINE};
  font-weight: ${FONT.WEIGHT.REGULAR};
  color: ${COLOR.GRAY2};
  margin-bottom: 0.5rem;
`;

const selectuplodGrid = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1.5rem;
  justify-content: center;
  place-items: center;
`;

const selectuplodGridinContents = css`
  background-color: ${COLOR.WHITE};
  width: 100%;
  height: 100%;
  min-height: 18rem;
  border-radius: 1.4rem;
  border: 1.5px solid ${COLOR.GRAY4};
  padding: 0.7rem;
`;

const selectuplodGridinContentsBox = css`
  width: 100%;
  height: 100%;
  minheight: 10rem;
  border-radius: 1.4rem;
  align-items: center;
  justify-content: center;
  padding: 0.7rem;
`;
const uploadLabelCSS = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  // border: 1.5px solid ${COLOR.GRAY4};
  border-radius: 0.5rem;
`;
const uploadInputCSS = css`
  display: none;
`;
const imageCSS = css`
  width: 11rem;
  height: auto;
  max-height: 9rem;
  object-fit: contain;
`;
const contentCSS = css`
  font-size: ${FONT.SIZE.HEADLINE};
  font-weight: ${FONT.WEIGHT.REGULAR};
  color: ${COLOR.GRAY2};
  margin: 1.5rem 0 0.5rem 0;
`;

const inputCSS = css`
  width: 100%;
  height: 2.5rem;
  border: 1.5px solid ${COLOR.GRAY4};
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const optionInputCSS = css`
  width: 100%;
  height: 2.5rem;
  border: 1.5px solid ${COLOR.GRAY4};
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
`;

const textareaCSS = css`
  width: 100%;
  height: 10rem;
  border: 1.5px solid ${COLOR.GRAY4};
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const buttonBoxCSS = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const buttonCSS = css`
  margin-right: 0.5rem;
  background: ${COLOR.MAIN};
`;

const controlSize = css`
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: auto;
  height: 70%;
`;

const controlSizetop = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;