//标准组件环境  学生基本信息
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml, formatMoment } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
import { studentById } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class StudentBasicInfor extends React.Component {

    constructor(props) {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {

            currentDataModel: null,
            pagingSearch: {
                studentId: props.studentId,
                realName: '',
            },
            data: [],
            data_list: [],
            loading: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'sex', 'certificate_type', 'reg_source', 'is_study', 'nation']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //检索数据
    fetch = () => {
        this.setState({ loading: true });
        var condition = this.state.pagingSearch.studentId;

        this.props.studentById(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            this.state.data_list = response.payload.data.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })

            }
        })
    }




    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content_1 =
            <ContentBox titleName='学生关键信息' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="姓　　名">
                                {this.state.data_list.realName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="性　　别">
                                {getDictionaryTitle(this.state.sex, this.state.data_list.gender)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='证件类型'
                            >
                                {getDictionaryTitle(this.state.certificate_type, this.state.data_list.certificateType)}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="证件号码"
                            >
                                {this.state.data_list.certificateNo}
                            </FormItem>
                        </Col>

                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="出生日期"
                            >
                                {timestampToTime(this.state.data_list.birth)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="民　　族"
                            >
                                {/* {this.state.data_list.nationId} */}
                                {getDictionaryTitle(this.state.nation, this.state.data_list.nationId)}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </ContentBox>

        let block_content_2 =
            <ContentBox titleName='学生目前情况' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="学生来源"
                            >
                                {getDictionaryTitle(this.state.reg_source, this.state.data_list.regSource)}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="所属区域"
                            >
                                {this.state.data_list.regRegionName}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='目前情况'
                            >
                                {/* {this.state.data_list.isStudy} */}
                                {getDictionaryTitle(this.state.is_study, this.state.data_list.isStudy)}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="当前学历"
                            >
                                {this.state.data_list.educationName}
                            </FormItem>
                        </Col>

                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="本科或专科毕业院校"
                            >
                                {this.state.data_list.graduateUniversityName}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="毕业年份"
                            >
                                {this.state.data_list.universityGraduateYear}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                label="就业城市"
                            >
                                {this.state.data_list.areaName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="高中毕业院校"
                            >
                                {this.state.data_list.highSchool}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="高中毕业年份"
                            >
                                {this.state.data_list.highSchoolGraduateYear}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="在职单位"
                            >
                                {this.state.data_list.workCompany}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="职位/入职年份"
                            >
                                {timestampToTime(this.state.data_list.workDate)}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="在读院校/校区"
                            >
                                {this.state.data_list.studyUniversityName}／{this.state.data_list.studyCampusName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="院系"
                            >
                                {this.state.data_list.studyDepartment}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="专业"
                            >
                                {this.state.data_list.studySpecialty}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="入学年份"
                            >
                                {this.state.data_list.studyUniversityEnterYear}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                style={{ paddingRight: 18 }}
                                label="了解中博教育的方式"
                            >
                                {this.state.data_list.ganWaysNames}

                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                style={{ paddingRight: 18 }}
                                label="备注"
                            >
                                {this.state.data_list.otherMark}

                            </FormItem>
                        </Col>
                    </Row>

                </Form>
            </ContentBox>
        let block_content_3 = <ContentBox titleName='学生联系方式' hideBottomBorder={true}>
            <Form className="search-form">
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="手　　机"
                        >
                            {this.state.data_list.mobile}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="电子邮箱"
                        >
                            {this.state.data_list.email}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label='QQ'
                        >
                            {this.state.data_list.qq}
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="微信"
                        >
                            {this.state.data_list.weixin}
                        </FormItem>
                    </Col>

                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="紧急联系人姓名"
                        >
                            {this.state.data_list.emergencyContactName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="紧急联系人电话"
                        >
                            {this.state.data_list.emergencyContactPhone}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="与紧急联系人关系"
                        >
                            {this.state.data_list.emergencyContactType==1?'父母':this.state.data_list.emergencyContactType==2?'其他':''}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="通讯地址"
                        >
                            {this.state.data_list.address}
                        </FormItem>
                    </Col>
                    <Col span={24}>
                        <FormItem
                            {...searchFormItemLayout24}
                            style={{ paddingRight: 18 }}
                            label="了解中博教育的方式"
                        >
                            {this.state.data_list.ganWaysNames}

                        </FormItem>
                    </Col>
                    <Col span={24}>
                        <FormItem
                            {...searchFormItemLayout24}
                            style={{ paddingRight: 18 }}
                            label="备注"
                        >
                            {this.state.data_list.otherMark}
                        </FormItem>
                    </Col>

                </Row>
            </Form>
        </ContentBox>
        let block_content_4 = <ContentBox titleName='学生相关信息' hideBottomBorder={true}>
            <Form className="search-form">
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="所属分部"
                        >
                            {this.state.data_list.branchName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="所属区域"
                        >
                            {this.state.data_list.regRegionName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label='学生来源'
                        >
                            {getDictionaryTitle(this.state.reg_source, this.state.data_list.regSource)}
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="市场人员"
                        >
                            {this.state.data_list.benefitMarketUserName}
                        </FormItem>
                    </Col>

                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="电咨人员"
                        >
                            {this.state.data_list.benefitPconsultUserName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="面咨人员"
                        >
                            {this.state.data_list.benefitFconsultUserName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="专属学服人员"
                        >
                            {this.state.data_list.privateTeacherName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="创建人姓名"
                        >
                            {this.state.data_list.createUserName}
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </ContentBox>

        let block_content_5 = <ContentBox titleName='学生扩展信息' >
            <Form className="search-form">
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="ACCA学生号"
                        >
                            {this.state.data_list.accaStudentName}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="ACCA注册类型"
                        >
                            {this.state.data_list.certificateRegType == 1 ? 'acca' : '' }
                            {this.state.data_list.certificateRegType == 2 ? 'fia' : '' }
                        </FormItem>
                    </Col>
                    <Col span={24}>
                        <FormItem
                            {...searchFormItemLayout24}
                            label='IMA会员号'
                        >
                            {this.state.data_list.memberName}
                        </FormItem>
                    </Col>

                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="实习情况"
                        >
                            {this.state.data_list.internshipSituation}
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </ContentBox>

        let block_content = <div>
            {/* 学生关键信息 */}
            {block_content_1}
            {/* 学生目前情况 */}
            {block_content_2}
            {/* 学生联系方式 */}
            {block_content_3}
            {/* 学生相关管理信息 */}
            {block_content_4}
            {/* 学生扩展信息 */}
            {block_content_5}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedStudentBasicInfor = Form.create()(StudentBasicInfor);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        studentById: bindActionCreators(studentById, dispatch),//根据学生id查询学生信息接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentBasicInfor);
