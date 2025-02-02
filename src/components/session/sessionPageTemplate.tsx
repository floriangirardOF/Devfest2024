import { AccessTime, Slideshow, YouTube } from "@mui/icons-material";
import { Button, Card, IconButton, Stack, Typography } from "@mui/material";
import classNames from "classnames";
import { graphql, useStaticQuery } from "gatsby";
import React from "react";
import { useTranslation } from "react-i18next";
import slots from "../../../data/slots.json";
import { Session } from "../../../json_schemas/interfaces/schema_sessions";
import { Speaker } from "../../../json_schemas/interfaces/schema_speakers";
import { MyLink } from "../../helpers/links";
import Layout from "../../layout";
import { Flag } from "../commun/flags";
import { Markdown } from "../commun/markdown";
import { DefaultPage } from "../commun/page";
import { SecondarySection, TertiarySection } from "../commun/section/section";
import { AvatarSpeaker, SessionComplexity, Tags } from "../schedule/common";
import "./style.scss";

const SessionPageTemplate: React.FC<{ pageContext: { session: Session } }> = ({
  pageContext: { session },
}) => {
  const { t } = useTranslation("translation", { keyPrefix: "sessions" });
  const slotLabel = getSessionSlotLabel(session.slot);
  const dateSession = session.slot.startsWith("day-1")
    ? "2022-10-19"
    : "2022-10-20";
  const urlOpenfeedback = `https://openfeedback.io/p32EOIbP5bj4WDdz8bJs/${dateSession}/${session.openfeedbackId}?hideHeader=true&forceColorScheme=dark`;

  return (
    <Layout>
      <DefaultPage title={session.title} noHero={true}>
        <TertiarySection slim>
          {session.cancelled && (
            <Typography variant="h1" color="primary">
              {t("cancelled")}
            </Typography>
          )}
          <Typography
            variant="h1"
            color="primary"
            className={classNames(
              "session-title",
              session.cancelled && "cancelled"
            )}
          >
            {session.title}
          </Typography>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="h3"
                style={{ textTransform: "capitalize", marginTop: "0" }}
              >
                {session.talkType}
              </Typography>
              <Tags tags={session.tags} color="secondary" />
              <SessionComplexity complexity={session.complexity} />
              <Flag lang={session.language} />
            </Stack>

            <Stack direction="row" spacing={1}>
              <AccessTime
                color="inherit"
              />
              <Typography variant="h3">
                {slotLabel} {session.room}
              </Typography>
            </Stack>
            { session.speakers ? <Stack spacing={1}>
              {session.speakers.map((speaker) => (
                <SpeakerCard key={speaker} speakerKey={speaker} />
              ))}
            </Stack> : <></>}

            {(session.youtube || session.slides) && (
              <Stack direction="row" spacing={3}>
                {session.youtube && (
                  <MyLink
                    to={`https://www.youtube.com/watch?v=${session.youtube}&list=PLuZ_sYdawLiUHU4E1i5RrFsRN_lQcgPwT`}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      aria-label="Youtube"
                    >
                      <IconButton>
                        <YouTube />
                      </IconButton>
                      Youtube
                    </Button>
                  </MyLink>
                )}
                {session.slides && (
                  <MyLink to={session.slides}>
                    <Button
                      variant="contained"
                      color="secondary"
                      aria-label="Slides"
                    >
                      <IconButton>
                        <Slideshow />
                      </IconButton>
                      Slides
                    </Button>
                  </MyLink>
                )}
              </Stack>
            )}
          </Stack>
        </TertiarySection>
        <SecondarySection slim>
          <Markdown content={session.abstract} />
        </SecondarySection>
        {session.openfeedbackId && (
          <iframe
            id="iframe-openfeedback"
            title="Openfeedback"
            src={urlOpenfeedback}
          />
        )}
      </DefaultPage>
    </Layout>
  );
};

export type PartialSpeaker = Omit<Speaker, "socials" | "bio">;

const SpeakerCard: React.FC<{ speakerKey }> = ({ speakerKey }) => {
  const { allSpeakersYaml } = useStaticQuery(graphql`
    query {
      allSpeakersYaml {
        edges {
          node {
            key
            name
            photoUrl
            city
            company
            companyLogo
          }
        }
      }
    }
  `);

  const speaker: PartialSpeaker = allSpeakersYaml.edges.find(
    (edge) => edge.node.key === speakerKey
  ).node;

  return (
    <MyLink to={"/speakers/" + speaker.key}>
      <Card
        sx={{
          maxWidth: "400px",
          padding: "5px",
          minHeight: "75px",
          color: "var(--tertiary)",
          backgroundColor: "var(--primary)",
          border: "1px solid white",
          borderLeft: "5px solid var(--secondary)"
        }}
      >
        <Stack
          direction="row"
          spacing={5}
          alignItems="center"
          sx={{ minHeight: "75px", paddingLeft: "10px" }}
        >
          <AvatarSpeaker speaker={speaker} size="medium" noLink />
          <Stack direction="column" spacing={1} justifyContent="center">
            <Typography variant="h4" color="inherit" style={{ color: "white" }}>
              {speaker.name}
            </Typography>
            <span style={{ color: "var(--tertiary-darker)", marginBottom: '0' }}>{speaker.company}</span>
            <span style={{ color: "var(--tertiary-darker)", marginTop: '0' }}>{speaker.city}</span>
          </Stack>
        </Stack>
      </Card>
    </MyLink>
  );
};

function getSessionSlotLabel(slotKey: string): string {
  const { t } = useTranslation("translation", { keyPrefix: "pages.schedule" });
  const slot = slots.slots.find((s) => s.key == slotKey);
  const slotDay = slotKey.startsWith("day-1") ? t("day1") : t("day2");
  return `${slotDay} ${slot?.start}`;
}

export default SessionPageTemplate;
